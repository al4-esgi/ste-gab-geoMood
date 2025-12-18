import { GenerativeModel } from '@google/generative-ai'
import { HttpService } from '@nestjs/axios'
import { Inject, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MemoryStoredFile } from 'nestjs-form-data'
import { IMoodService } from '../_utils/interfaces/mood-service.interface'
import { AnalysisRating, MoodRating } from '../_utils/types/mood-rating'
import {
  GEMINI_PRO_MODEL_TOKEN,
  GEMINI_PROMPT,
  GEMINI_VISION_PROMPT,
  NEGATIVE_KEYWORDS,
  POSITIVE_KEYWORDS,
} from './_utils/constants'
import { WeatherApiResponseDto } from './_utils/dto/response/weather-api-response.dto'
import { decodeLlmResponse } from './_utils/schemas/llm-response.schema'
import { WeatherConfig } from 'src/_utils/config/env.config'
import { MoodDocument, Mood } from 'src/users/schemas/mood.schema'
import { UserDocument } from 'src/users/schemas/user.schema'
import { UsersService } from 'src/users/users.service'
import { CreateMoodDto } from './_utils/dto/request/create-mood.dto'

@Injectable()
export class MoodsService implements IMoodService {
  private readonly logger = new Logger(MoodsService.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @Inject(GEMINI_PRO_MODEL_TOKEN)
    private readonly geminiModel: GenerativeModel,
    private readonly usersService: UsersService
  ) {}

  async fetchWeatherData(
    lat: number,
    lng: number
  ): Promise<WeatherApiResponseDto> {
    const wheatherApiKey =
      this.configService.get<WeatherConfig>("Weather").WHEATHER_API_KEY;

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
    } catch (error) {
      return this.handleApiFailure();
    }
  }

  async getTextSentimentAnalysis(userInput: string): Promise<number> {
    try {
      const prompt = GEMINI_PROMPT + userInput
      const result = await this.geminiModel.generateContent(prompt)
      const response = result.response.text()
      const llmResponse = decodeLlmResponse(response)
      return llmResponse.score
    } catch (e) {
      this.logger.error('Text sentiment analysis failed, using keyword fallback', e)
      return this.handleLlmFailure(userInput)
    }
  }

  async getPictureSentimentAnalysis(picture: MemoryStoredFile): Promise<number> {
    try {
      const result = await this.geminiModel.generateContent([
        GEMINI_VISION_PROMPT,
        {
          inlineData: {
            mimeType: picture.mimeType,
            data: picture.buffer.toString('base64'),
          },
        },
      ])

      const response = result.response.text()
      const llmResponse = decodeLlmResponse(response)

      if (llmResponse.score < 1 || llmResponse.score > 5) {
        this.logger.error(`Vision API returned out-of-bounds score: ${llmResponse.score}`)
        return 3
      }

      return llmResponse.score
    } catch (e) {
      this.logger.error('Vision API sentiment analysis failed, returning neutral score', e)
      return 3
    }
  }

  private handleLlmFailure(userInput: string): number {
    const normalizedText = userInput.toLowerCase().replace(/[.,!?;:'"""()]/g, ' ')
    const words = normalizedText.split(' ')

    let positiveCount = 0
    let negativeCount = 0
    for (const word of words) {
      if (POSITIVE_KEYWORDS.has(word)) positiveCount++
      if (NEGATIVE_KEYWORDS.has(word)) negativeCount++
    }

    const totalKeywords = positiveCount + negativeCount

    if (totalKeywords === 0) {
      return 3
    }
    const positiveRatio = positiveCount / totalKeywords
    const score = Math.round(1 + positiveRatio * 4)

    return Math.max(1, Math.min(5, score))
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
    if (ratingPhotoAnalysis !== undefined && (ratingPhotoAnalysis < 0 || ratingPhotoAnalysis > 5)) {
      throw new Error('Photo rating must be between 0 and 5')
    }
    return new MoodRating(
      userSentimentAnalysis,
      ratingUserNumberInput,
      ratingWeather,
      ratingPhotoAnalysis
    );
  }

  async createMood(body: CreateMoodDto): Promise<MoodDocument> {
    const user = await this.usersService.findUserByEmail(body.email);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const alreadyPosted = await this.usersService.checkDuplicateMoodInHour(
      user._id.toString()
    );

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

    // if (body.picture) {
    //   mood.picture = body.picture;
    // }

    const updatedUser = await this.usersService.addMoodToUser(
      user._id.toString(),
      mood
    );
    const addedMood = updatedUser.moods[updatedUser.moods.length - 1];

    return addedMood as MoodDocument;
  }

  async getTodaysMoods(): Promise<UserDocument[]> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return this.usersService.getMoodsByDateRange(startOfDay, endOfDay);
  }
}
