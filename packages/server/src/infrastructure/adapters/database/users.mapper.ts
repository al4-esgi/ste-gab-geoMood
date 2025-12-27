import { Injectable } from '@nestjs/common'
import { UserEntity } from '../../../domain/entities/users.entity'
import { UserDocument } from './schemas/user.schema'
import { MoodsMapper } from './moods.mapper'

@Injectable()
export class UsersMapper {
  constructor(private readonly moodsMapper: MoodsMapper) {}

  toDomain(userDoc: UserDocument): UserEntity {
    return new UserEntity({
      id: userDoc._id.toString(),
      email: userDoc.email,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt,
      moods: userDoc.moods.map((moodDoc) => this.moodsMapper.toDomain(moodDoc)),
    })
  }
}
