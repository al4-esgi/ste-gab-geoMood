import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MINIO_CLIENT_TOKEN } from 'src/_utils/constants'
import { MinioMapper } from './minio.mapper'
import { minioProviders } from './minio.provider'
import { MinioService } from './minio.service'

@Module({
  imports: [ConfigModule],
  providers: [MinioService, MinioMapper, ...minioProviders],
  exports: [MinioService, MinioMapper, MINIO_CLIENT_TOKEN],
})
export class MinioModule {}
