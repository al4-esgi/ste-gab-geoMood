import { HttpModule } from '@nestjs/axios'
import { Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { MemoryStoredFile, NestjsFormDataModule } from 'nestjs-form-data'
import { validateEnv } from '../../src/_utils/config/env.config'
import { MoodsModule } from '../../src/moods/moods.module'
import { UsersModule } from '../../src/users/users.module'
import { MongoMemoryModule, MongoMemoryService } from '../setup/mongodb-memory-server'

@Global()
@Module({
  imports: [
    MongoMemoryModule,
    MongooseModule.forRootAsync({
      imports: [MongoMemoryModule],
      inject: [MongoMemoryService],
      useFactory: async (mongoMemory: MongoMemoryService) => ({
        uri: await mongoMemory.start(),
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
})
export class TestModule {}
