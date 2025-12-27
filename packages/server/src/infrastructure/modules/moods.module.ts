import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { CreateMoodUseCase } from '../../application/create-mood'
import { GetMoodsUseCase } from '../../application/get-mood.usecase'
import { MoodsMapper } from '../adapters/database/moods.mapper'
import { UsersMapper } from '../adapters/database/users.mapper'
import { UsersRepository } from '../adapters/database/users.repository'
import { moodsProviders } from '../adapters/gemini/gemini.provider'
import { SentimentAnalyzerAdapter } from '../adapters/gemini/sentiment-analyzer.adapter'
import { WeatherMapper } from '../adapters/weather/weather.mapper'
import { WeatherAdapater } from '../adapters/weather/weather.adapter'
import { MoodsController } from '../controllers/moods.controller'
import { UsersModule } from './users.module'
import { MoodsService } from './moods.service'

@Module({
  imports: [HttpModule, UsersModule],
  controllers: [MoodsController],
  providers: [
    CreateMoodUseCase,
    GetMoodsUseCase,
    MoodsService,
    WeatherMapper,
    ...moodsProviders,
    {
      provide: 'ISentimentAnalyzerPort',
      useClass: SentimentAnalyzerAdapter,
    },
    {
      provide: 'IWeatherPort',
      useClass: WeatherAdapater,
    },
    {
      provide: 'IUserRepositoryPort',
      useExisting: UsersRepository,
    },
  ],
  exports: [CreateMoodUseCase, GetMoodsUseCase, MoodsService],
})
export class MoodsModule {}
