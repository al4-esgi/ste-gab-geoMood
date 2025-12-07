import { Global, Module } from '@nestjs/common'
import { MoodsService } from './moods.service'

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [MoodsService],
  exports: [MoodsService],
})
export class AgnoModule {}
