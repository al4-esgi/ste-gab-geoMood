import { Injectable } from "@nestjs/common";
import { UserEntity } from "./users.entity";
import { UserDocument } from "backup/users copy/schemas/user.schema";
import { MoodsMapper } from "src/infrastructure/adapters/database/moods.mapper";

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
    });
  }
}
