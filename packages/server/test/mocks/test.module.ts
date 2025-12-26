import { HttpModule } from '@nestjs/axios'
import { Global, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { MemoryStoredFile, NestjsFormDataModule } from 'nestjs-form-data'
import { MoodsModule } from '../../src/application/moods/moods.module'
import { validateEnv } from '../../src/application/users/_utils/config/env.config'
import { UsersModule } from '../../src/application/users/users.module'
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
    UsersModule,
    MoodsModule,
  ],
  exports: [MoodsModule, UsersModule],
})
export class TestModule {}
