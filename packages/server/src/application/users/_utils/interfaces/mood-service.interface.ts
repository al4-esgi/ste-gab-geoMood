import { MemoryStoredFile } from 'nestjs-form-data'
import { LocationDto } from 'src/moods/_utils/dto/request/location.dto'
import { WeatherApiResponseDto } from 'src/moods/_utils/dto/response/weather-api-response.dto'
import { AnalysisRating, MoodRating } from '../types/mood-rating'
import { MoodDocument } from 'src/users/schemas/mood.schema';
import { UserDocument } from 'src/users/schemas/user.schema';

export interface ICreateMoodInputDto {
  textContent: string;
  rating: number;
  picture?: MemoryStoredFile;
  location: LocationDto;
}

export interface IMoodService {
  fetchWeatherData(lat: number, lng: number): Promise<WeatherApiResponseDto>
  handleApiFailure(): Promise<WeatherApiResponseDto>
  getWeather(lat: number, lon: number): Promise<WeatherApiResponseDto>
  getTextSentimentAnalysis(userInput: string): Promise<number>
  getPictureSentimentAnalysis(pictureBuffer: MemoryStoredFile): Promise<number>
  getAnalysisRatingFromWeather(weatherResponse: WeatherApiResponseDto): AnalysisRating
  createMoodScore(
    userSentimentAnalysis: AnalysisRating,
    ratingUserNumberInput: AnalysisRating,
    ratingWeather: AnalysisRating,
    ratingPhotoAnalysis?: AnalysisRating
  ): MoodRating;
  createMood(body: ICreateMoodInputDto): Promise<MoodDocument>;
  getTodaysMoods(): Promise<UserDocument[]>;
}
