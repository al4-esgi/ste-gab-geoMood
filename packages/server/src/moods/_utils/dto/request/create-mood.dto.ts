import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsInt, IsNotEmpty, IsString, Max, MaxLength, Min, ValidateIf, ValidateNested } from 'class-validator'
import { Optional } from 'class-validator-extended'
import { HasMimeType, IsFile, MaxFileSize, MemoryStoredFile } from 'nestjs-form-data'
import { ICreateMoodInputDto } from 'src/_utils/interfaces/mood-service.interface'
import { LocationDto } from './location.dto'
import { Type, Transform, plainToInstance } from 'class-transformer'

export class CreateMoodDto implements ICreateMoodInputDto {
  @ApiProperty({
    description: 'Text content of the mood',
    maxLength: 1000,
    example: 'Feeling great today!'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  textContent: string

  @ApiProperty({
    description: 'Mood rating from 1 to 5',
    minimum: 1,
    maximum: 5,
    example: 4
  })
  @Transform(({ value }) => parseInt(value, 10))
  @Max(5)
  @Min(1)
  @IsInt()
  rating: number

  @ApiPropertyOptional({
    description: 'Optional picture attachment',
    type: 'string',
    format: 'binary'
  })
  @ValidateIf((o) => o.picture !== undefined)
  @Optional()
  @IsFile()
  @MaxFileSize(50e6)
  @HasMimeType(['image/jpeg', 'image/png'])
  picture?: MemoryStoredFile

  @ApiProperty({
    description: 'Location information',
    type: LocationDto
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const parsed = JSON.parse(value);
      return plainToInstance(LocationDto, parsed);
    }
    return value;
  })
  @Type(() => LocationDto)
  @ValidateNested()
  @IsNotEmpty()
  location: LocationDto

  @ApiProperty({
    description: 'User email',
    example: 'user@example.com'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string
}
