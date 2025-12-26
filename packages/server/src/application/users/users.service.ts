import { Injectable, NotFoundException } from '@nestjs/common'
import { Mood } from '../../infrastructure/adapters/database/schemas/mood.schema'
import { UserDocument } from '../../infrastructure/adapters/database/schemas/user.schema'
import { UsersRepository } from '../../infrastructure/adapters/database/users.repository'

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async createUser(name: string, email: string): Promise<UserDocument> {
    return this.usersRepository.createUser(name, email)
  }

  async findUserById(userId: string): Promise<UserDocument | null> {
    return this.usersRepository.findUserById(userId)
  }

  async findUserByEmail(email: string): Promise<UserDocument | null> {
    return this.usersRepository.findUserByEmail(email)
  }

  async addMoodToUser(userId: string, mood: Mood): Promise<UserDocument> {
    const updatedUser = await this.usersRepository.addMoodToUser(userId, mood)
    if (!updatedUser) {
      throw new NotFoundException('User not found')
    }
    return updatedUser
  }

  async getUserMoods(userId: string): Promise<Mood[]> {
    return this.usersRepository.getUserMoods(userId)
  }

  async getMoodsByDateRange(startDate: Date, endDate: Date): Promise<UserDocument[]> {
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
