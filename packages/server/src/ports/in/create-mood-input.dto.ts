import { MemoryStoredFile } from 'nestjs-form-data'
import { LocationDto } from '../../infrastructure/dto/request/location.dto'

export interface ICreateMoodInputDto {
  email: string
  textContent: string
  rating: number
  picture?: MemoryStoredFile
  location: LocationDto
}
