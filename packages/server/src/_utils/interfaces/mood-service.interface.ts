import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { MemoryStoredFile } from "nestjs-form-data";
import { EnvironmentVariables } from "../config/env.config";
import { LocationDto } from "src/moods/dto/request/location.dto";
import { WeatherApiResponseDto } from "src/moods/dto/response/weather-api-response.dto";

export interface ICreateMoodInputDto {
  textContent: string;
  rating: number;
  picture?: MemoryStoredFile;
  location: LocationDto;
}

export interface IMoodService {
  httpService: HttpService;
  configService: ConfigService<EnvironmentVariables, true>;
  fetchWeatherData(lat: number, lng: number): Promise<WeatherApiResponseDto>;
  handleApiFailure(): Promise<WeatherApiResponseDto>;
  getWeather(lat: number, lon: number): Promise<WeatherApiResponseDto>;
}
