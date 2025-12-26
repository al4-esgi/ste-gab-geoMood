import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { moodsProviders } from '../../infrastructure/adapters/gemini/gemini.provider'
import { GeminiAdapter } from '../../infrastructure/adapters/gemini/gemini.adapter'
import { WeatherAdapater } from '../../infrastructure/adapters/weather/weather.adapter'
import { MoodsController } from '../../infrastructure/controllers/moods.controller'
import { MoodsService } from '../moods.service'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [HttpModule, UsersModule],
  controllers: [MoodsController],
  providers: [
    MoodsService,
    ...moodsProviders,
    {
      provide: 'IGeminiPort',
      useClass: GeminiAdapter,
    },
    {
      provide: 'IWeatherPort',
      useClass: WeatherAdapater,
    },
  ],
  exports: [MoodsService],
})
export class MoodsModule {}
