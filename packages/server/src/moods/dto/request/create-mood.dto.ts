import { IsInt, IsNotEmpty, IsString, Max, MaxLength, Min, ValidateIf, ValidateNested } from 'class-validator'
import { Optional } from 'class-validator-extended'
import { HasMimeType, IsFile, MaxFileSize, MemoryStoredFile } from 'nestjs-form-data'
import { ICreateMoodInputDto } from 'src/_utils/interfaces/mood-service.interface'
import { LocationDto } from './location.dto'

export class CreateMoodDto implements ICreateMoodInputDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  textContent: string

  @Max(5)
  @Min(1)
  @IsInt()
  rating: number

  @ValidateIf((o) => o.picture !== undefined)
  @Optional()
  @IsFile()
  @MaxFileSize(50e6)
  @HasMimeType(['image/jpeg', 'image/png'])
  picture?: MemoryStoredFile

  @ValidateNested()
  location: LocationDto
}
