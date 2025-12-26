import { WeatherVO } from "../../domain/value-objects/weather.vo";

export interface IWeatherPort {
  getWeather(lat: number, long: number): Promise<WeatherVO>;
}
