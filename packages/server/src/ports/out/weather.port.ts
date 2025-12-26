import { WeatherEntity } from "../../domain/entities/weather.entity";

export interface IWeatherPort {
  getWeather(lat: number, long: number): Promise<WeatherEntity>;
}
