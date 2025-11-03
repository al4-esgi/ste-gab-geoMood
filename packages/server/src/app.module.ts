import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { MemoryStoredFile, NestjsFormDataModule } from 'nestjs-form-data'
import { type EnvironmentVariables, validateEnv } from './_utils/config/env.config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
// import { MinioModule } from './minio/minio.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validateEnv,
      isGlobal: true,
      envFilePath: ['.env.development', '.env'],
    }),
    // MinioModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvironmentVariables, true>) => ({
        uri: configService.get('DATABASE').DATABASE_URL,
        dbName: configService.get('DATABASE').DATABASE_NAME,
      }),
    }),
    NestjsFormDataModule.config({ isGlobal: true, storage: MemoryStoredFile }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
