import { Injectable, Module } from '@nestjs/common'
import { MongoMemoryServer } from 'mongodb-memory-server'

@Injectable()
export class MongoMemoryService {
  private static instance: MongoMemoryServer | null = null

  async start(): Promise<string> {
    if (!MongoMemoryService.instance) {
      MongoMemoryService.instance = await MongoMemoryServer.create()
    }
    return MongoMemoryService.instance.getUri()
  }

  getUri(): string {
    if (!MongoMemoryService.instance) {
      throw new Error('MongoMemoryServer not started. Call start() first.')
    }
    return MongoMemoryService.instance.getUri()
  }
}

@Module({
  providers: [MongoMemoryService],
  exports: [MongoMemoryService],
})
export class MongoMemoryModule {}
