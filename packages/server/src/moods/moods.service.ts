import { GenerativeModel } from '@google/generative-ai'
import { HttpService } from '@nestjs/axios'
import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
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

@Injectable()
export class MoodsService implements IMoodService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @Inject(GEMINI_PRO_MODEL_TOKEN)
    private readonly geminiModel: GenerativeModel,
  ) {}

  fetchWeatherData(lat: number, lng: number): Promise<WeatherApiResponseDto> {
    throw new Error('Method not implemented.')
  }
  handleApiFailure(): Promise<WeatherApiResponseDto> {
    throw new Error('Method not implemented.')
  }
  getWeather(lat: number, lon: number): Promise<WeatherApiResponseDto> {
    throw new Error('Method not implemented.')
  }
  fetchWheatherData(lat: number, lng: number): Promise<any> {
    throw new Error('Method not implemented.')
  }

  async getTextSentimentAnalysis(userInput: string): Promise<number> {
    try {
      const prompt = GEMINI_PROMPT + userInput
      const result = await this.geminiModel.generateContent(prompt)
      const response = result.response.text()
      const llmResponse = decodeLlmResponse(response)
      return llmResponse.score
    } catch (e) {
      console.error(e)
      return this.handleLlmFailure(userInput)
    }
  }

  async getPictureSentimentAnalysis(pictureBuffer: Buffer): Promise<number> {
    try {
      const result = await this.geminiModel.generateContent([
        GEMINI_VISION_PROMPT,
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: pictureBuffer.toString('base64'),
          },
        },
      ])

      const response = result.response.text()
      const llmResponse = decodeLlmResponse(response)
      return llmResponse.score
    } catch (e) {
      console.error(e)
      return 3
    }
  }

  private handleLlmFailure(userInput: string): number {
    const normalizedText = userInput.toLowerCase().replace(/[.,!?;:'"""()]/g, ' ')
    const words = normalizedText.split(' ')

    let positiveCount = 0
    let negativeCount = 0
    for (const word of words) {
      if (POSITIVE_KEYWORDS.includes(word)) positiveCount++
      if (NEGATIVE_KEYWORDS.includes(word)) negativeCount++
    }

    const totalKeywords = positiveCount + negativeCount

    if (totalKeywords === 0) {
      return 3
    }
    const positiveRatio = positiveCount / totalKeywords
    const score = Math.round(1 + positiveRatio * 4)

    return Math.max(1, Math.min(5, score))
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
