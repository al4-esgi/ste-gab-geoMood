import { HttpModule } from '@nestjs/axios'
import { Global, Module } from '@nestjs/common'
import { UsersModule } from '../users/users.module'
import { MoodsController } from './moods.controller'
import { moodsProviders } from './moods.provider'
import { MoodsService } from './moods.service'
import { UsersService } from 'src/users/users.service'

@Global()
@Module({
  imports: [HttpModule, UsersModule],
  controllers: [MoodsController],
  providers: [MoodsService, ...moodsProviders, UsersService],
  exports: [MoodsService],
})
export class MoodsModule {}
