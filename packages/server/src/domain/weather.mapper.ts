import { Injectable } from '@nestjs/common'
import { WeatherApiResponseDto } from '../../backup/moods copy/_utils/dto/response/weather-api-response.dto'
import { WeatherEntity } from './weather.entity'

@Injectable()
export class WeatherMapper {
  toDomain(weatherData: WeatherApiResponseDto): WeatherEntity {
    return new WeatherEntity(weatherData)
  }
}
