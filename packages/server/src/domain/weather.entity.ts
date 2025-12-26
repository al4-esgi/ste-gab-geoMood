import { WeatherApiResponseDto } from "../application/moods/_utils/dto/response/weather-api-response.dto";
import { AnalysisRating } from "./services/mood-rating.service";

export class WeatherEntity {
  public readonly data: WeatherApiResponseDto;
  public readonly condition: string;
  public readonly temperature: number;
  public readonly humidity: number;
  public readonly windSpeed: number;
  public readonly pressure: number;

  constructor(weatherData: WeatherApiResponseDto) {
    this.data = weatherData;

    const current = weatherData.current;
    this.condition = current?.weather?.[0]?.main || "Unknown";
    this.temperature = current ? current.temp - 273.15 : 0;
    this.humidity = current?.humidity || 0;
    this.windSpeed = current?.wind_speed || 0;
    this.pressure = current?.pressure || 0;
  }

  getAnalysisRatingFromWeather(): AnalysisRating {
    if (!this.data.current) return 3;

    const current = this.data.current;
    let score = 3;

    const tempCelsius = current.temp - 273.15;
    if (tempCelsius >= 18 && tempCelsius <= 25) {
      score += 1;
    } else if (tempCelsius < 10 || tempCelsius > 30) {
      score -= 1;
    }

    if (current.clouds < 20) {
      score += 1;
    } else if (current.clouds > 80) {
      score -= 1;
    }

    const weatherMain = current.weather?.[0]?.main?.toLowerCase();
    if (weatherMain === "clear") score += 0.5;
    if (weatherMain === "rain") score -= 1;
    if (weatherMain === "thunderstorm") score -= 1.5;
    if (weatherMain === "snow") score -= 0.5;

    if (current.wind_speed > 10) score -= 0.5;

    const finalScore = Math.max(1, Math.min(5, Math.round(score)));
    return finalScore as AnalysisRating;
  }
}
