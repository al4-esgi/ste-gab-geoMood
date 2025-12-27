import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { CreateMoodUseCase } from '../../application/create-mood'
import { GetMoodsUseCase } from '../../application/get-mood.usecase'
import { moodsProviders } from '../adapters/gemini/gemini.provider'
import { SentimentAnalyzerAdapter } from '../adapters/gemini/sentiment-analyzer.adapter'
import { WeatherAdapater } from '../adapters/weather/weather.adapter'
import { WeatherMapper } from '../adapters/weather/weather.mapper'
import { MoodsController } from '../controllers/moods.controller'
import { UsersModule } from './users.module'
import { UsersRepository } from '../adapters/database/users.repository'

@Module({
  imports: [HttpModule, UsersModule],
  controllers: [MoodsController],
  providers: [
    CreateMoodUseCase,
    GetMoodsUseCase,
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
  exports: [CreateMoodUseCase, GetMoodsUseCase],
})
export class MoodsModule {}
