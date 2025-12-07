import { HttpModule } from '@nestjs/axios'
import { Global, Module } from '@nestjs/common'
import { moodsProviders } from './moods.provider'
import { MoodsService } from './moods.service'

@Global()
@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [MoodsService, ...moodsProviders],
  exports: [MoodsService],
})
export class MoodsModule {}
