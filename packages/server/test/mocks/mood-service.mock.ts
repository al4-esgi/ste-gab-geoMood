import { HttpService } from "@nestjs/axios";
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ImageData } from "../../src/domain/value-objects/image-data.vo";
import {
  AnalysisRating,
  MoodRating,
} from "../../src/domain/value-objects/mood-rating.vo";
import { MoodVO } from "../../src/domain/value-objects/mood.vo";
import { UsersRepository } from "../../src/infrastructure/adapters/database/users.repository";
import {
  EnvironmentVariables,
  WeatherConfig,
} from "../../src/infrastructure/config/env.config";
import { CreateMoodDto } from "../../src/infrastructure/dto/request/create-mood.dto";
import { WeatherApiResponseDto } from "../../src/infrastructure/dto/response/weather-api-response.dto";
import {
  Mood,
  MoodDocument,
} from "../../src/infrastructure/adapters/database/schemas/mood.schema";

@Injectable()
export class MockMoodService {
  constructor(
    public readonly httpService: HttpService,
    public readonly configService: ConfigService<EnvironmentVariables, true>,
    public readonly usersRepository: UsersRepository
  ) {}

  getPictureSentimentAnalysis(picture: ImageData): Promise<number> {
    throw new Error("Method not implemented.");
  }

  async fetchWeatherData(
    lat: number,
    lng: number
  ): Promise<WeatherApiResponseDto> {
    const wheatherApiKey =
      this.configService.get<WeatherConfig>("Weather").WEATHER_API_KEY;

    const result = await this.httpService.axiosRef.get<WeatherApiResponseDto>(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lng}&appid=${wheatherApiKey}`
    );

    return result.data;
  }

  async handleApiFailure() {
    return new WeatherApiResponseDto();
  }

  async getWeather(lat: number, lon: number): Promise<WeatherApiResponseDto> {
    try {
      return await this.fetchWeatherData(lat, lon);
    } catch {
      return this.handleApiFailure();
    }
  }

  async getTextSentimentAnalysis(userInput: string): Promise<AnalysisRating> {
    const text = userInput.toLowerCase().split(" ");
    const positiveWords = [
      "bien",
      "heureux",
      "content",
      "joyeux",
      "super",
      "génial",
    ];
    const negativeWords = ["mal", "triste", "déprimé", "anxieux", "stressé"];

    let positiveCount = 0;
    let negativeCount = 0;

    for (const userWord of text) {
      if (positiveWords.includes(userWord)) positiveCount++;
      if (negativeWords.includes(userWord)) negativeCount++;
    }

    if (positiveCount > negativeCount) return 5;
    if (negativeCount > positiveCount) return 1;
    return 3;
  }

  getAnalysisRatingFromWeather(
    weatherResponse: WeatherApiResponseDto
  ): AnalysisRating {
    if (!weatherResponse.current) return 3;

    const current = weatherResponse.current;
    let score = 3;

    const tempCelsius = current.temp - 273.15;
    if (tempCelsius >= 18 && tempCelsius <= 25) {
      score += 1;
    } else if (tempCelsius < 10 || tempCelsius > 30) {
      score -= 1;
    }

    if (current.clouds < 20) {
      score += 1;
    } else if (current.clouds > 80) {
      score -= 1;
    }

    const weatherMain = current.weather?.[0]?.main?.toLowerCase();
    if (weatherMain === "clear") score += 0.5;
    if (weatherMain === "rain") score -= 1;
    if (weatherMain === "thunderstorm") score -= 1.5;
    if (weatherMain === "snow") score -= 0.5;

    if (current.wind_speed > 10) score -= 0.5;

    const finalScore = Math.max(1, Math.min(5, Math.round(score)));
    return finalScore as AnalysisRating;
  }

  createMoodScore(
    userSentimentAnalysis: AnalysisRating,
    ratingUserNumberInput: AnalysisRating,
    ratingWeather: AnalysisRating,
    ratingPhotoAnalysis?: AnalysisRating
  ): MoodRating {
    if (ratingUserNumberInput < 1 || ratingUserNumberInput > 5) {
      throw new Error("User rating must be between 1 and 5");
    }

    if (userSentimentAnalysis < 0 || userSentimentAnalysis > 5) {
      throw new Error("Text sentiment rating must be between 0 and 5");
    }

    if (ratingWeather < 0 || ratingWeather > 5) {
      throw new Error("Weather rating must be between 0 and 5");
    }

    if (
      ratingPhotoAnalysis !== undefined &&
      (ratingPhotoAnalysis < 0 || ratingPhotoAnalysis > 5)
    ) {
      throw new Error("Photo rating must be between 0 and 5");
    }

    return new MoodRating(
      userSentimentAnalysis,
      ratingUserNumberInput,
      ratingWeather,
      ratingPhotoAnalysis
    );
  }

  async createMood(body: CreateMoodDto): Promise<MoodDocument> {
    const user = await this.usersRepository.findUserByEmail(body.email);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const alreadyPosted = user.checkDuplicateMoodInHour();

    if (alreadyPosted) {
      throw new UnauthorizedException("Mood already posted in the last hour");
    }

    const weatherData = await this.getWeather(
      body.location.lat,
      body.location.lng
    );

    const textSentimentRating = await this.getTextSentimentAnalysis(
      body.textContent
    );

    const weatherRating = this.getAnalysisRatingFromWeather(weatherData);

    const moodRating = this.createMoodScore(
      textSentimentRating as AnalysisRating,
      body.rating as AnalysisRating,
      weatherRating,
      undefined
    );

    const mood: Mood = {
      textContent: body.textContent,
      rating: moodRating.total,
      location: body.location,
      weather: {
        condition: weatherData.current?.weather?.[0]?.main || "Unknown",
        temperature: weatherData.current
          ? weatherData.current.temp - 273.15
          : 0,
        humidity: weatherData.current ? weatherData.current.humidity : 0,
        windSpeed: weatherData.current ? weatherData.current.wind_speed : 0,
        pressure: weatherData.current ? weatherData.current.pressure : 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const moodVO = new MoodVO(mood);
    const updatedUser = await this.usersRepository.addMoodToUser(
      user.id,
      moodVO
    );
    const addedMood = updatedUser!.moods[updatedUser!.moods.length - 1];

    return addedMood as unknown as MoodDocument;
  }

  async getTodaysMoods(): Promise<any[]> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return this.usersRepository.getMoodsByDateRange(startOfDay, endOfDay);
  }
}
