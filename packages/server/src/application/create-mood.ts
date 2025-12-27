import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { MoodVO } from '../domain/value-objects/mood.vo'
import { ICreateMoodInputDto } from '../ports/in/create-mood-input.dto'
import { ICreateMoodUseCase } from '../ports/in/create-mood.usecase'
import { ISentimentAnalyzerPort } from '../ports/out/sentiment-analyzer.port'
import { UserRepositoryPort } from '../ports/out/users.repository.port'
import { IWeatherPort } from '../ports/out/weather.port'
import { MoodRating, AnalysisRating } from '../domain/value-objects/mood-rating.vo'

@Injectable()
export class CreateMoodUseCase implements ICreateMoodUseCase {
  constructor(
    @Inject('ISentimentAnalyzerPort')
    private readonly sentimentAnalyzer: ISentimentAnalyzerPort,
    @Inject('IWeatherPort')
    private readonly weatherAdapter: IWeatherPort,
    @Inject('IUserRepositoryPort')
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async createMood(body: ICreateMoodInputDto): Promise<MoodVO> {
    const user = await this.userRepository.findUserByEmail(body.email)
    if (!user) {
      throw new NotFoundException('User not found')
    }

    const alreadyPosted = user.checkDuplicateMoodInHour()

    if (alreadyPosted) {
      throw new UnauthorizedException('Mood already posted in the last hour')
    }

    const [weather, textSentimentRating] = await Promise.all([
      this.weatherAdapter.getWeather(body.location.lat, body.location.lng),
      this.sentimentAnalyzer.getTextSentimentAnalysis(body.textContent),
    ])
    const weatherRating = weather.getAnalysisRatingFromWeather()
    const pictureSentimentRating = body.picture
      ? await this.sentimentAnalyzer.getPictureSentimentAnalysis(body.picture)
      : undefined

    const moodRating = new MoodRating(
      textSentimentRating as AnalysisRating,
      body.rating as AnalysisRating,
      weatherRating,
      pictureSentimentRating as AnalysisRating,
    )

    const mood = new MoodVO({
      textContent: body.textContent,
      rating: moodRating.total,
      location: {
        lat: body.location.lat,
        lng: body.location.lng,
      },
      weather: {
        condition: weather.condition,
        temperature: weather.temperature,
        humidity: weather.humidity,
        windSpeed: weather.windSpeed,
        pressure: weather.pressure,
      },
      picture: body.picture
        ? `data:${body.picture.mimeType};base64,${body.picture.buffer.toString('base64')}`
        : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    user.addMood(mood)
    await this.userRepository.save(user)

    return mood
  }
}
