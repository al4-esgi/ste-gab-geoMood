import { HttpModule } from '@nestjs/axios'
import { Global, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { MemoryStoredFile, NestjsFormDataModule } from 'nestjs-form-data'
import { validateEnv } from '../../src/_utils/config/env.config'
import { MoodsModule } from '../../src/moods/moods.module'
import { UsersModule } from '../../src/users/users.module'
import { EnvironmentVariables } from './_utils/config/env.config'
import { MockMoodService } from './mood-service.mock'

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvironmentVariables, true>) => ({
        uri: configService.get('DATABASE').DATABASE_URL,
        dbName: configService.get('DATABASE').DATABASE_NAME,
      }),
    }),
    NestjsFormDataModule.config({ isGlobal: true, storage: MemoryStoredFile }),
    HttpModule,
    ConfigModule.forRoot({
      validate: validateEnv,
      isGlobal: true,
      envFilePath: ['.env.development', '.env'],
    }),
    MoodsModule,
    UsersModule,
  ],
  providers: [MockMoodService],
})
export class TestModule {}
