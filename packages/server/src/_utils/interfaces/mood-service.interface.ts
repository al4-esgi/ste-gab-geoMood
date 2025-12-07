import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { MemoryStoredFile } from 'nestjs-form-data'
import { LocationDto } from 'src/moods/dto/request/location.dto'
import { WeatherApiResponseDto } from 'src/moods/dto/response/weather-api-response.dto'
import { EnvironmentVariables } from '../config/env.config'
import { AnalysisRating, MoodRating } from '../types/mood-rating'

export interface ICreateMoodInputDto {
  textContent: string
  rating: number
  picture?: MemoryStoredFile
  location: LocationDto
}

export interface IMoodService {
  configService: ConfigService<EnvironmentVariables, true>
  fetchWeatherData(lat: number, lng: number): Promise<WeatherApiResponseDto>
  handleApiFailure(): Promise<WeatherApiResponseDto>
  getWeather(lat: number, lon: number): Promise<WeatherApiResponseDto>
  readonly httpService: HttpService
  fetchWheatherData(lat: number, lng: number): Promise<any>
  getTextSentimentAnalysis(userInput: string): Promise<any>
  getAnalysisRatingFromWeather(weatherResponse: WeatherApiResponseDto): AnalysisRating
  createMoodScore(
    userSentimentAnalysis: AnalysisRating,
    ratingUserNumberInput: AnalysisRating,
    ratingWeather: AnalysisRating,
    ratingPhotoAnalysis?: AnalysisRating,
  ): MoodRating
}
