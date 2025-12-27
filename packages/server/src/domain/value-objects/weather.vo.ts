import { AnalysisRating } from './mood-rating.vo'

export interface WeatherCondition {
  main: string
  description?: string
}

export interface WeatherData {
  temp: number
  clouds: number
  weather: WeatherCondition[]
  wind_speed: number
  humidity?: number
  pressure?: number
}

export interface CreateWeatherVOProps {
  condition: string
  temperature: number
  humidity: number
  windSpeed: number
  pressure: number
  rawData?: WeatherData
}

export class WeatherVO {
  public readonly condition: string
  public readonly temperature: number
  public readonly humidity: number
  public readonly windSpeed: number
  public readonly pressure: number
  private readonly rawData?: WeatherData

  constructor(props: CreateWeatherVOProps) {
    this.condition = props.condition
    this.temperature = props.temperature
    this.humidity = props.humidity
    this.windSpeed = props.windSpeed
    this.pressure = props.pressure
    this.rawData = props.rawData
  }

  getAnalysisRatingFromWeather(): AnalysisRating {
    if (!this.rawData) {
      return this.calculateRatingFromProperties()
    }

    const current = this.rawData
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

  private calculateRatingFromProperties(): AnalysisRating {
    // If all values are default/zero with unknown condition, treat as missing data → neutral
    const isMissingData =
      this.condition.toLowerCase() === 'unknown' &&
      this.temperature === 0 &&
      this.humidity === 0 &&
      this.windSpeed === 0 &&
      this.pressure === 0

    if (isMissingData) {
      return 3 as AnalysisRating
    }

    let score = 3

    if (this.temperature >= 18 && this.temperature <= 25) {
      score += 1
    } else if (this.temperature < 10 || this.temperature > 30) {
      score -= 1
    }

    const condition = this.condition.toLowerCase()
    if (condition === 'clear' || condition === 'sunny') score += 1
    if (condition === 'rain' || condition === 'rainy') score -= 1
    if (condition === 'thunderstorm') score -= 1.5
    if (condition === 'snow') score -= 0.5

    if (this.windSpeed > 10) score -= 0.5

    const finalScore = Math.max(1, Math.min(5, Math.round(score)))
    return finalScore as AnalysisRating
  }
}
