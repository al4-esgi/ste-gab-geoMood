import { MoodVO } from 'src/domain/value-objects/mood.vo'
import { UserEntity } from '../../domain/entities/users.entity'
import { RepositoryPort } from '../../shared/ports/repository.port'

export interface UserRepositoryPort extends RepositoryPort<UserEntity> {
  findUserByEmail(email: string): Promise<UserEntity>
  save(user: UserEntity): Promise<void>
  getMoodsByDateRange(startDate: Date, endDate: Date): Promise<UserEntity[]>
  addMoodToUser(userId: string, mood: MoodVO): Promise<UserEntity | null>
}
