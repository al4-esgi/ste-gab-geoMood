import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { WeatherApiResponseDto } from '../../../application/moods/_utils/dto/response/weather-api-response.dto'
import { WeatherConfig } from '../../../application/users/_utils/config/env.config'
import { WeatherEntity } from '../../../domain/entities/weather.entity'
import { WeatherMapper } from '../../../domain/weather.mapper'
import { IWeatherPort } from '../../../ports/out/weather.port'

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

  async handleApiFailure() {
    return new WeatherEntity(new WeatherApiResponseDto())
  }

  async getWeather(lat: number, lon: number): Promise<WeatherEntity> {
    try {
      const result = await this.fetchWeatherData(lat, lon)
      return this.weatherMapper.toDomain(result)
    } catch (error) {
      return this.handleApiFailure()
    }
  }
}
