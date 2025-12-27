import { Injectable, NotFoundException } from '@nestjs/common'
import { UserEntity } from '../../domain/entities/users.entity'
import { MoodVO } from '../../domain/value-objects/mood.vo'
import { Mood } from '../adapters/database/schemas/mood.schema'
import { UserDocument } from '../adapters/database/schemas/user.schema'
import { UsersRepository } from '../adapters/database/users.repository'

/**
 * @deprecated This service is kept for backwards compatibility with tests.
 * New code should use CreateMoodUseCase and GetMoodsUseCase directly.
 */
@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async createUser(name: string, email: string): Promise<UserDocument> {
    return this.usersRepository.createUser(name, email)
  }

  async findUserById(userId: string): Promise<UserDocument | null> {
    return this.usersRepository.findUserById(userId)
  }

  async findUserByEmail(email: string): Promise<UserEntity> {
    return this.usersRepository.findUserByEmail(email)
  }

  async addMoodToUser(userId: string, mood: MoodVO): Promise<UserEntity> {
    const updatedUser = await this.usersRepository.addMoodToUser(userId, mood)
    if (!updatedUser) {
      throw new NotFoundException('User not found')
    }
    return updatedUser
  }

  async getUserMoods(userId: string): Promise<Mood[]> {
    return this.usersRepository.getUserMoods(userId)
  }

  async getMoodsByDateRange(startDate: Date, endDate: Date): Promise<UserEntity[]> {
    return this.usersRepository.getMoodsByDateRange(startDate, endDate)
  }

  async getMoodById(userId: string, moodId: string): Promise<Mood | null> {
    return this.usersRepository.getMoodById(userId, moodId)
  }

  async checkDuplicateMoodInHour(userId: string): Promise<boolean> {
    return this.usersRepository.checkDuplicateMoodInHour(userId)
  }

  async deleteUser(userId: string): Promise<void> {
    await this.usersRepository.deleteUser(userId)
  }
}
