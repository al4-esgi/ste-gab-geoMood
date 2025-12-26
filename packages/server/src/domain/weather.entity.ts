import { WeatherApiResponseDto } from '../../backup/moods copy/_utils/dto/response/weather-api-response.dto'
import { AnalysisRating } from '../application/users/_utils/types/mood-rating'

export class WeatherEntity {
  constructor(weatherData: WeatherApiResponseDto) {
    this.data = weatherData
  }

  data: WeatherApiResponseDto

  getAnalysisRatingFromWeather(): AnalysisRating {
    if (!this.data.current) return 3

    const current = this.data.current
    let score = 3

    const tempCelsius = current.temp - 273.15
    if (tempCelsius >= 18 && tempCelsius <= 25) {
      score += 1
    } else if (tempCelsius < 10 || tempCelsius > 30) {
      score -= 1
    }

    if (current.clouds < 20) {
      score += 1
    } else if (current.clouds > 80) {
      score -= 1
    }

    const weatherMain = current.weather?.[0]?.main?.toLowerCase()
    if (weatherMain === 'clear') score += 0.5
    if (weatherMain === 'rain') score -= 1
    if (weatherMain === 'thunderstorm') score -= 1.5
    if (weatherMain === 'snow') score -= 0.5

    if (current.wind_speed > 10) score -= 0.5

    const finalScore = Math.max(1, Math.min(5, Math.round(score)))
    return finalScore as AnalysisRating
  }
}
