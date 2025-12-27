import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { MemoryStoredFile, NestjsFormDataModule } from 'nestjs-form-data'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { type EnvironmentVariables, validateEnv } from './infrastructure/config/env.config'
import { MoodsModule } from './infrastructure/modules/moods.module'
import { UsersModule } from './infrastructure/modules/users.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validateEnv,
      isGlobal: true,
      envFilePath: ['.env.development', '.env'],
    }),
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
    UsersModule,
    MoodsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
