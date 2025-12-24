import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { UsersModule } from '../users/users.module'
import { MoodsController } from './moods.controller'
import { moodsProviders } from './moods.provider'
import { MoodsService } from './moods.service'

@Module({
  imports: [HttpModule, UsersModule],
  controllers: [MoodsController],
  providers: [MoodsService, ...moodsProviders],
  exports: [MoodsService],
})
export class MoodsModule {}
