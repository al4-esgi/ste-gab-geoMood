import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  EnvironmentVariables,
  WeatherConfig,
} from "src/_utils/config/env.config";
import { IMoodService } from "src/_utils/interfaces/mood-service.interface";
import { WeatherApiResponseDto } from "src/moods/dto/response/weather-api-response.dto";

@Injectable()
export class MockMoodService implements IMoodService {
  constructor(
    public readonly httpService: HttpService,
    public readonly configService: ConfigService<EnvironmentVariables, true>
  ) {}

  async fetchWeatherData(
    lat: number,
    lng: number
  ): Promise<WeatherApiResponseDto> {
    const wheatherApiKey =
      this.configService.get<WeatherConfig>("Weather").WHEATHER_API_KEY;

    const result = await this.httpService.axiosRef.get<WeatherApiResponseDto>(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lng}&appid=${wheatherApiKey}`
    );

    return result.data;
  }

  async handleApiFailure() {
    return new WeatherApiResponseDto();
  }

  async getWeather(lat: number, lon: number): Promise<WeatherApiResponseDto> {
    try {
      return await this.fetchWeatherData(lat, lon);
    } catch (error) {
      return this.handleApiFailure();
    }
  }
}
