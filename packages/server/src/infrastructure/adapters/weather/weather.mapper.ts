import { Injectable } from '@nestjs/common'
import { WeatherApiResponseDto } from '../../dto/response/weather-api-response.dto'
import { WeatherVO } from '../../../domain/value-objects/weather.vo'

@Injectable()
export class WeatherMapper {
  toDomain(weatherData: WeatherApiResponseDto): WeatherVO {
    return new WeatherVO(weatherData)
  }
}
