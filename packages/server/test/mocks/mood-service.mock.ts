import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  EnvironmentVariables,
  WeatherConfig,
} from "src/_utils/config/env.config";
import { IMoodService } from "src/_utils/interfaces/mood-service.interface";
import { WeatherResponseDto } from "src/moods/dto/response/Weather-api.dto";

@Injectable()
export class MockMoodService implements IMoodService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService<EnvironmentVariables, true>
  ) {}

  async fetchWheatherData(
    lat: number,
    lng: number
  ): Promise<WeatherResponseDto> {
    const wheatherApiKey =
      this.configService.get<WeatherConfig>("Weather").WHEATHER_API_KEY;

    const result = await this.httpService.axiosRef.get<WeatherResponseDto>(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lng}&appid=${wheatherApiKey}`
    );

    console.error(result);

    return result.data;
  }

  async handleApiFailure() {
    return new WeatherResponseDto();
  }

  getWheather(lat: number, lon: number): Promise<WeatherResponseDto> {
    try {
      return this.fetchWheatherData(lat, lon);
    } catch (error) {
      return this.handleApiFailure();
    }
  }
}
