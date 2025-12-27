import { Inject, Injectable, Logger } from '@nestjs/common'
import { MemoryStoredFile } from 'nestjs-form-data'
import { CreateMoodUseCase } from '../../application/create-mood'
import { GetMoodsUseCase } from '../../application/get-mood.usecase'
import { UserEntity } from '../../domain/entities/users.entity'
import { AnalysisRating, MoodRating } from '../../domain/value-objects/mood-rating.vo'
import { MoodVO } from '../../domain/value-objects/mood.vo'
import { WeatherVO } from '../../domain/value-objects/weather.vo'
import { ISentimentAnalyzerPort } from '../../ports/out/sentiment-analyzer.port'
import { IWeatherPort } from '../../ports/out/weather.port'
import { CreateMoodDto } from '../dto/request/create-mood.dto'
import { WeatherApiResponseDto } from '../dto/response/weather-api-response.dto'

@Injectable()
export class MoodsService {
  private readonly logger = new Logger(MoodsService.name)

  constructor(
    private readonly createMoodUseCase: CreateMoodUseCase,
    private readonly getMoodsUseCase: GetMoodsUseCase,
    @Inject('ISentimentAnalyzerPort')
    private readonly sentimentAnalyzer: ISentimentAnalyzerPort,
    @Inject('IWeatherPort')
    private readonly weatherAdapter: IWeatherPort,
  ) {}

  async fetchWeatherData(lat: number, lng: number): Promise<WeatherApiResponseDto> {
    return this.weatherAdapter.fetchWeatherData(lat, lng)
  }

  async handleApiFailure(): Promise<WeatherVO> {
    return this.weatherAdapter.handleApiFailure()
  }

  async getTextSentimentAnalysis(text: string): Promise<number> {
    return this.sentimentAnalyzer.getTextSentimentAnalysis(text)
  }

  async getPictureSentimentAnalysis(picture: MemoryStoredFile): Promise<number> {
    return this.sentimentAnalyzer.getPictureSentimentAnalysis(picture)
  }

  getAnalysisRatingFromWeather(weatherResponse: WeatherApiResponseDto): AnalysisRating {
    const weatherVO = new WeatherVO(weatherResponse)
    return weatherVO.getAnalysisRatingFromWeather()
  }

  createMoodScore(
    userSentimentAnalysis: AnalysisRating,
    ratingUserNumberInput: AnalysisRating,
    ratingWeather: AnalysisRating,
    ratingPhotoAnalysis?: AnalysisRating,
  ): MoodRating {
    if (ratingUserNumberInput < 1 || ratingUserNumberInput > 5) {
      throw new Error('User rating must be between 1 and 5')
    }

    if (userSentimentAnalysis < 0 || userSentimentAnalysis > 5) {
      throw new Error('Text sentiment rating must be between 0 and 5')
    }

    if (ratingWeather < 0 || ratingWeather > 5) {
      throw new Error('Weather rating must be between 0 and 5')
    }

    if (ratingPhotoAnalysis !== undefined && (ratingPhotoAnalysis < 0 || ratingPhotoAnalysis > 5)) {
      throw new Error('Photo rating must be between 0 and 5')
    }

    return new MoodRating(userSentimentAnalysis, ratingUserNumberInput, ratingWeather, ratingPhotoAnalysis)
  }

  async createMood(body: CreateMoodDto): Promise<MoodVO> {
    return this.createMoodUseCase.createMood(body)
  }

  async getTodaysMoods(): Promise<UserEntity[]> {
    const moods = await this.getMoodsUseCase.getTodaysMoods()
    return []
  }
}
