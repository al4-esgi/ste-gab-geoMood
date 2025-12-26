import { Injectable } from '@nestjs/common'
import { WeatherApiResponseDto } from '../application/moods/_utils/dto/response/weather-api-response.dto'
import { WeatherEntity } from './entities/weather.entity'

@Injectable()
export class WeatherMapper {
  toDomain(weatherData: WeatherApiResponseDto): WeatherEntity {
    return new WeatherEntity(weatherData)
  }
}
