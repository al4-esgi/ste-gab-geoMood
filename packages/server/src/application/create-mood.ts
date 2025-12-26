import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { MoodEntity } from "../domain/mood.entity";
import { ICreateMoodInputDto } from "../ports/in/create-mood-input.dto";
import { ICreateMoodUseCase } from "../ports/in/create-mood.usecase";
import { IGeminiPort } from "../ports/out/gemini.port";
import { UserRepositoryPort as IUserRepositoryPort } from "../ports/out/users.repository.port";
import { IWeatherPort } from "../ports/out/weather.port";
import { MoodsMapper } from "src/infrastructure/adapters/database/moods.mapper";

@Injectable()
export class CreateMood implements ICreateMoodUseCase {
  constructor(
    private readonly geminiAdapter: IGeminiPort,
    private readonly weatherAdapter: IWeatherPort,
    private readonly userRepository: IUserRepositoryPort,
    private readonly moodsMapper: MoodsMapper
  ) {}

  async createMood(body: ICreateMoodInputDto): Promise<MoodEntity> {
    const user = await this.userRepository.findUserByEmail(body.email);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const alreadyPosted = user.checkDuplicateMoodInHour();

    if (alreadyPosted) {
      throw new UnauthorizedException("Mood already posted in the last hour");
    }

    const [weather, textSentimentRating] = await Promise.all([
      this.weatherAdapter.getWeather(body.location.lat, body.location.lng),
      this.geminiAdapter.getTextSentimentAnalysis(body.textContent),
    ]);
    const weatherRating = weather.getAnalysisRatingFromWeather();
    const pictureSentimentRating = body.picture
      ? await this.geminiAdapter.getPictureSentimentAnalysis(body.picture)
      : undefined;

    const moodRating = this.createMoodScore(
      textSentimentRating as AnalysisRating,
      body.rating as AnalysisRating,
      weatherRating,
      pictureSentimentRating as AnalysisRating
    );

    // const mood: Mood = {
    //   textContent: body.textContent,
    //   rating: moodRating.total,
    //   location: body.location,
    //   weather: {
    //     condition: weatherData.current?.weather?.[0]?.main || 'Unknown',
    //     temperature: weatherData.current ? weatherData.current.temp - 273.15 : 0,
    //     humidity: weatherData.current ? weatherData.current.humidity : 0,
    //     windSpeed: weatherData.current ? weatherData.current.wind_speed : 0,
    //     pressure: weatherData.current ? weatherData.current.pressure : 0,
    //   },
    //   createdAt: new Date(),
    //   updatedAt: new Date(),
    // }

    const mood = new MoodEntity({
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
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (body.picture) {
      mood.picture = `data:${body.picture.mimeType};base64,${body.picture.buffer.toString("base64")}`;
    }

    user.addMood(mood);
    const mappedMood = this.moodsMapper.toPersistence(mood);
    await this.userRepository.addMoodToUser(user.id, mappedMood);
    const addedMood = user.moods[user.moods.length - 1];

    return addedMood;
  }
}
