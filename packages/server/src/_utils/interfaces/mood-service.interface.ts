import { HttpService } from "@nestjs/axios";
import { MemoryStoredFile } from "nestjs-form-data";
import { LocationDto } from "src/moods/dto/request/location.dto";

export interface ICreateMoodInputDto {
  textContent: string;
  rating: number;
  picture?: MemoryStoredFile;
  location: LocationDto;
}

export interface IMoodService {
  readonly httpService: HttpService,
  fetchWheatherData(lat: number, lng: number): Promise<any>;
  handleApiFailure(): Promise<any>;
}
