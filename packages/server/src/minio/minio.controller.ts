import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { GetMinioStreamByKeyPipe, MinioFilePipeResult } from './_utils/get-minio-stream-by-key.pipe';

@ApiTags('Minio')
@Controller('minio')
export class MinioController {
  constructor() {}

  @Get(':minioKey')
  @ApiOperation({ summary: 'Get file by key' })
  @ApiParam({ name: 'minioKey', type: String })
  getFile(@Param('minioKey', GetMinioStreamByKeyPipe) minioResult: MinioFilePipeResult, @Res() res: Response) {
    res.setHeader('Content-Type', minioResult.stats?.metaData?.['content-type']);
    return minioResult.stream.pipe(res);
  }
}
