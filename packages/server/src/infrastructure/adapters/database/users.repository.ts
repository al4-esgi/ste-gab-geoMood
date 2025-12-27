import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { UserEntity } from '../../../domain/entities/users.entity'
import { MoodVO } from '../../../domain/value-objects/mood.vo'
import { UserRepositoryPort } from '../../../ports/out/users.repository.port'
import { MoodsMapper } from './moods.mapper'
import { Mood } from './schemas/mood.schema'
import { User, UserDocument } from './schemas/user.schema'
import { UsersMapper } from './users.mapper'

@Injectable()
export class UsersRepository implements UserRepositoryPort {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly usersMapper: UsersMapper,
    private readonly moodsMapper: MoodsMapper,
  ) {}

  async createUser(name: string, email: string): Promise<UserDocument> {
    const user = new this.userModel({ name, email, moods: [] })
    return user.save()
  }

  async findUserById(userId: string): Promise<UserDocument | null> {
    return this.userModel.findById(userId).exec()
  }

  async findUserByEmail(email: string): Promise<UserEntity> {
    let user = await this.userModel.findOne({ email }).exec()

    if (!user) {
      user = new this.userModel({ name: email, email, moods: [] })
      await user.save()
    }

    return this.usersMapper.toDomain(user)
  }

  async save(user: UserEntity): Promise<void> {
    const moods = user.moods.map((m) => this.moodsMapper.toPersistence(m))
    await this.userModel
      .findByIdAndUpdate(
        user.id,
        {
          email: user.email,
          moods: moods,
          updatedAt: new Date(),
        },
        { new: true },
      )
      .exec()
  }

  async addMoodToUser(userId: string, mood: MoodVO): Promise<UserEntity | null> {
    const moodPersistence = this.moodsMapper.toPersistence(mood)
    const userDoc = await this.userModel
      .findByIdAndUpdate(userId, { $push: { moods: moodPersistence } }, { new: true })
      .exec()
    if (!userDoc) return null
    return this.usersMapper.toDomain(userDoc)
  }

  async getUserMoods(userId: string): Promise<Mood[]> {
    const user = await this.userModel.findById(userId).exec()
    return user?.moods || []
  }

  async getMoodsByDateRange(startDate: Date, endDate: Date): Promise<UserEntity[]> {
    const users = await this.userModel.aggregate([
      {
        $match: {
          moods: {
            $elemMatch: {
              createdAt: { $gte: startDate, $lte: endDate }
            }
          }
        }
      },
      {
        $addFields: {
          moods: {
            $filter: {
              input: '$moods',
              cond: {
                $and: [
                  { $gte: ['$$this.createdAt', startDate] },
                  { $lte: ['$$this.createdAt', endDate] }
                ]
              }
            }
          }
        }
      },
      {
        $addFields: {
          moods: {
            $slice: [
              {
                $sortArray: {
                  input: '$moods',
                  sortBy: { createdAt: -1 }
                }
              },
              1
            ]
          }
        }
      }
    ]).exec()

    return users.map((u) => this.usersMapper.toDomain(u as any))
  }

  async getMoodById(userId: string, moodId: string): Promise<Mood | null> {
    const user = await this.userModel.findById(userId).exec()
    if (!user) return null
    return user.moods.find((m: any) => m._id?.toString() === moodId) || null
  }

  async updateMood(userId: string, moodId: string, updates: Partial<Mood>): Promise<UserDocument | null> {
    return this.userModel
      .findOneAndUpdate(
        { _id: userId, 'moods._id': moodId },
        {
          $set: {
            'moods.$.textContent': updates.textContent,
            'moods.$.rating': updates.rating,
            'moods.$.updatedAt': new Date(),
          },
        },
        { new: true },
      )
      .exec()
  }

  async deleteMood(userId: string, moodId: string): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(userId, { $pull: { moods: { _id: moodId } } }, { new: true }).exec()
  }

  async deleteUser(userId: string): Promise<void> {
    await this.userModel.findByIdAndDelete(userId).exec()
  }

  async checkDuplicateMoodInHour(userId: string): Promise<boolean> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const user = await this.userModel.findById(userId).exec()
    if (!user) return false

    return user.moods.some((mood: any) => mood.createdAt && new Date(mood.createdAt) > oneHourAgo)
  }
}
