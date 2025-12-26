import { WeatherEntity } from "../../domain/weather.entity";

export interface IWeatherPort {
	getWeather(lat : number, long: number) : Promise<WeatherEntity>
}
