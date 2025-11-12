import { MemoryStoredFile } from "nestjs-form-data"

export interface ICreateMoodInputDto {
  textContent : string
  rating : number
  weatherData : unknown
  picture: MemoryStoredFile
  location: unknown
}

export interface IMoodService {}
