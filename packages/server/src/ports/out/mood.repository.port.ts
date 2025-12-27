import { MoodVO } from '../../domain/value-objects/mood.vo'
import { RepositoryPort } from '../../shared/ports/repository.port'

export interface MoodRepositoryPort extends RepositoryPort<MoodVO> {
  deleteMood(userId: string, moodId: string): Promise<MoodVO | null>
  getMoodsByDateRange(startDate: Date, endDate: Date): Promise<MoodVO[]>
  getMoodById(userId: string, moodId: string): Promise<MoodVO | null>
  updateMood(userId: string, moodId: string, updates: Partial<MoodVO>): Promise<MoodVO | null>
}
