import { MemoryStoredFile } from "nestjs-form-data";
import { ICreateMoodInputDto } from "src/_utils/interfaces/mood-service.interface";

export class CreateMoodDto implements ICreateMoodInputDto {
    textContent: string;
    rating: number;
    weatherData: unknown;
    picture: MemoryStoredFile;
    location: unknown;
}
