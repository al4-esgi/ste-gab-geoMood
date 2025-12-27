import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { MoodsMapper } from '../adapters/database/moods.mapper'
import { User, UserSchema } from '../adapters/database/schemas/user.schema'
import { UsersMapper } from '../adapters/database/users.mapper'
import { UsersRepository } from '../adapters/database/users.repository'
import { UsersService } from './users.service'

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  providers: [UsersRepository, UsersService, UsersMapper, MoodsMapper],
  exports: [UsersService, UsersRepository, UsersMapper, MoodsMapper],
})
export class UsersModule {}
