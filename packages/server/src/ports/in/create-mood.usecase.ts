import { MoodEntity } from '../../domain/mood.entity'
import { ICreateMoodInputDto } from './create-mood-input.dto'

export interface ICreateMoodUseCase {
  createMood(createMoodDto: ICreateMoodInputDto): Promise<MoodEntity>
}
