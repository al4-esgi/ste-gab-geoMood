import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { MemoryStoredFile } from "nestjs-form-data";
import { EnvironmentVariables } from "src/_utils/config/env.config";
import { LocationDto } from "src/moods/dto/request/location.dto";

export interface ICreateMoodInputDto {
  textContent: string;
  rating: number;
  picture?: MemoryStoredFile;
  location: LocationDto;
}

export interface IMoodService {
  httpService: HttpService;
  configService: ConfigService<EnvironmentVariables, true>;
  fetchWheatherData(lat: number, lng: number): Promise<any>;
  handleApiFailure(): Promise<any>;
  getWheather(lat: number, lon: number): Promise<any>;
}
