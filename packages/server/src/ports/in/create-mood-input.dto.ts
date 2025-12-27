import { ImageData } from '../../domain/value-objects/image-data.vo'
import { LocationDto } from '../../infrastructure/dto/request/location.dto'

export interface ICreateMoodInputDto {
  email: string
  textContent: string
  rating: number
  picture?: ImageData
  location: LocationDto
}
