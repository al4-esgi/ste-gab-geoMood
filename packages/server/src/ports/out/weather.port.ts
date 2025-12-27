import { WeatherApiResponseDto } from '../../infrastructure/dto/response/weather-api-response.dto'
import { WeatherVO } from '../../domain/value-objects/weather.vo'

export interface IWeatherPort {
  getWeather(lat: number, long: number): Promise<WeatherVO>
  fetchWeatherData(lat: number, lng: number): Promise<WeatherApiResponseDto>
  handleApiFailure(): Promise<WeatherVO>
}
