import { MemoryStoredFile } from 'nestjs-form-data'
import { AnalysisRating, MoodRating } from '../types/mood-rating'
import { LocationDto } from 'src/moods/_utils/dto/request/location.dto'
import { WeatherApiResponseDto } from 'src/moods/_utils/dto/response/weather-api-response.dto'

export interface ICreateMoodInputDto {
  textContent: string
  rating: number
  picture?: MemoryStoredFile
  location: LocationDto
}

export interface IMoodService {
  fetchWeatherData(lat: number, lng: number): Promise<WeatherApiResponseDto>
  handleApiFailure(): Promise<WeatherApiResponseDto>
  getWeather(lat: number, lon: number): Promise<WeatherApiResponseDto>
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
