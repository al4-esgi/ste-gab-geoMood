import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { WeatherVO } from '../../../domain/value-objects/weather.vo'
import { WeatherConfig } from '../../config/env.config'
import { WeatherApiResponseDto } from '../../dto/response/weather-api-response.dto'
import { IWeatherPort } from '../../../ports/out/weather.port'
import { WeatherMapper } from './weather.mapper'

@Injectable()
export class WeatherAdapater implements IWeatherPort {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly weatherMapper: WeatherMapper,
  ) {}

  async fetchWeatherData(lat: number, lng: number): Promise<WeatherApiResponseDto> {
    const wheatherApiKey = this.configService.get<WeatherConfig>('Weather').WHEATHER_API_KEY

    const result = await this.httpService.axiosRef.get<WeatherApiResponseDto>(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lng}&appid=${wheatherApiKey}`,
    )

    return result.data
  }

  async handleApiFailure(): Promise<WeatherVO> {
    return new WeatherVO({
      condition: 'Unknown',
      temperature: 0,
      humidity: 0,
      windSpeed: 0,
      pressure: 0,
    })
  }

  async getWeather(lat: number, lon: number): Promise<WeatherVO> {
    try {
      const result = await this.fetchWeatherData(lat, lon)
      return this.weatherMapper.toDomain(result)
    } catch {
      return this.handleApiFailure()
    }
  }
}
