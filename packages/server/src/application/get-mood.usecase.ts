import { Inject, Injectable } from '@nestjs/common'
import { MoodVO } from '../domain/value-objects/mood.vo'
import { UserRepositoryPort } from '../ports/out/users.repository.port'

@Injectable()
export class GetMoodsUseCase {
  constructor(
    @Inject('IUserRepositoryPort')
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async getTodaysMoods(): Promise<MoodVO[]> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const users = await this.userRepository.getMoodsByDateRange(today, tomorrow)
    return users.flatMap((user) => user.moods)
  }
}
