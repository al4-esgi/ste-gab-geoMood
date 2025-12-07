import { Injectable, PipeTransform } from '@nestjs/common'
import { BucketItemStat } from 'minio'
import { Readable } from 'stream'
import { MinioService } from '../minio.service'

export interface MinioFilePipeResult {
  stats: BucketItemStat
  stream: Readable
}

@Injectable()
export class GetMinioStreamByKeyPipe implements PipeTransform {
  constructor(private readonly minioService: MinioService) {}

  async transform(minioKey: string) {
    const [stats, file] = await Promise.all([this.minioService.getStats(minioKey), this.minioService.getFile(minioKey)])
    return { stats, stream: file }
  }
}
