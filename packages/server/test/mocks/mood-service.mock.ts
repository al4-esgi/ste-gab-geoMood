import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EnvironmentVariables, WeatherConfig } from 'src/_utils/config/env.config'
import { IMoodService } from 'src/_utils/interfaces/mood-service.interface'
import { AnalysisRating, MoodRating } from '../../src/_utils/types/mood-rating'
import { WeatherApiResponseDto } from '../../src/moods/_utils/dto/response/weather-api-response.dto'

@Injectable()
export class MockMoodService implements IMoodService {
  constructor(
    public readonly httpService: HttpService,
    public readonly configService: ConfigService<EnvironmentVariables, true>,
  ) {}

  fetchWheatherData(lat: number, lng: number): Promise<any> {
    throw new Error('Method not implemented.')
  }

  async fetchWeatherData(lat: number, lng: number): Promise<WeatherApiResponseDto> {
    const wheatherApiKey = this.configService.get<WeatherConfig>('Weather').WHEATHER_API_KEY

    const result = await this.httpService.axiosRef.get<WeatherApiResponseDto>(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lng}&appid=${wheatherApiKey}`,
    )

    return result.data
  }

  async handleApiFailure() {
    return new WeatherApiResponseDto()
  }

  async getWeather(lat: number, lon: number): Promise<WeatherApiResponseDto> {
    try {
      return await this.fetchWeatherData(lat, lon)
    } catch (error) {
      return this.handleApiFailure()
    }
  }

  async getTextSentimentAnalysis(userInput: string): Promise<AnalysisRating> {
    const text = userInput.toLowerCase().split(' ')
    const positiveWords = ['bien', 'heureux', 'content', 'joyeux', 'super', 'génial']
    const negativeWords = ['mal', 'triste', 'déprimé', 'anxieux', 'stressé']

    let positiveCount = 0
    let negativeCount = 0

    for (const userWord of text) {
      if (positiveWords.includes(userWord)) positiveCount++
      if (negativeWords.includes(userWord)) negativeCount++
    }

    if (positiveCount > negativeCount) return 5
    if (negativeCount > positiveCount) return 1
    return 3
  }

  getPictureSentimentAnalysis(pictureBuffer?: Buffer): Promise<number> {
    return new Promise(() => 3)
  }

  getAnalysisRatingFromWeather(weatherResponse: WeatherApiResponseDto): AnalysisRating {
    if (!weatherResponse.current) return 3

    const current = weatherResponse.current
    let score = 3

    const tempCelsius = current.temp - 273.15
    if (tempCelsius >= 18 && tempCelsius <= 25) {
      score += 1
    } else if (tempCelsius < 10 || tempCelsius > 30) {
      score -= 1
    }

    if (current.clouds < 20) {
      score += 1
    } else if (current.clouds > 80) {
      score -= 1
    }

    const weatherMain = current.weather?.[0]?.main?.toLowerCase()
    if (weatherMain === 'clear') score += 0.5
    if (weatherMain === 'rain') score -= 1
    if (weatherMain === 'thunderstorm') score -= 1.5
    if (weatherMain === 'snow') score -= 0.5

    if (current.wind_speed > 10) score -= 0.5

    const finalScore = Math.max(1, Math.min(5, Math.round(score)))
    return finalScore as AnalysisRating
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

    if (ratingPhotoAnalysis < 0 || ratingPhotoAnalysis > 5) {
      throw new Error('Photo rating must be between 0 and 5')
    }

    return new MoodRating(userSentimentAnalysis, ratingUserNumberInput, ratingWeather, ratingPhotoAnalysis)
  }
}
