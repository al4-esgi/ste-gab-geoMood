import { MoodVO } from '../../domain/value-objects/mood.vo'
import { ICreateMoodInputDto } from './create-mood-input.dto'

export interface ICreateMoodUseCase {
  createMood(createMoodDto: ICreateMoodInputDto): Promise<MoodVO>
}
