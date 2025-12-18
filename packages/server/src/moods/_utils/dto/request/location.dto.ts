import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, Max, Min } from "class-validator";
import { Transform } from 'class-transformer';

export class LocationDto {
  @ApiProperty({
    description: 'Latitude coordinate',
    minimum: -90,
    maximum: 90,
    example: 48.8566
  })
  @Transform(({ value }) => typeof value === 'string' ? parseFloat(value) : value)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number

  @ApiProperty({
    description: 'Longitude coordinate',
    minimum: -180,
    maximum: 180,
    example: 2.3522
  })
  @Transform(({ value }) => typeof value === 'string' ? parseFloat(value) : value)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number
}
