import { Injectable } from '@nestjs/common'
import { WeatherApiResponseDto } from '../../dto/response/weather-api-response.dto'
import { WeatherVO } from '../../../domain/value-objects/weather.vo'

@Injectable()
export class WeatherMapper {
  toDomain(weatherData: WeatherApiResponseDto): WeatherVO {
    const current = weatherData.current

    return new WeatherVO({
      condition: current?.weather?.[0]?.main || 'Unknown',
      temperature: current ? current.temp - 273.15 : 0,
      humidity: current?.humidity || 0,
      windSpeed: current?.wind_speed || 0,
      pressure: current?.pressure || 0,
      rawData: current
        ? {
            temp: current.temp,
            clouds: current.clouds,
            weather: current.weather,
            wind_speed: current.wind_speed,
            humidity: current.humidity,
            pressure: current.pressure,
          }
        : undefined,
    })
  }
}
