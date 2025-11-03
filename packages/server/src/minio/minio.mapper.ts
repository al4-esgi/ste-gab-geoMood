import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { GetFileDto, GetMinioFileDto } from './_utils/dto/response/get-minio-file.dto';
import { MinioFile } from './minio-file.schema';
import { MinioService } from './minio.service';

@Injectable()
export class MinioMapper {
  constructor(private readonly minioService: MinioService) {}

  toGetMinioFileDto = (minioFile: MinioFile): GetMinioFileDto => ({
    key: minioFile.key,
    fileName: minioFile.fileName,
    mimeType: minioFile.mimeType,
    size: minioFile.size,
  });

  toGetFileDto = async (minioFile: MinioFile): Promise<GetFileDto> => ({
    url: await this.minioService.getPresignedUrl(minioFile.key),
    fileName: minioFile.fileName,
    mimeType: minioFile.mimeType,
    size: minioFile.size,
  });

  toOrganizationCoverImageKey = (organizationId: string) => `organization/${organizationId}/coverImage`;

  toAgentCoverImageKey = (organizationId: string, agentId: string): string =>
    `${organizationId}/agents-cover-images/${agentId}.png`;

  toImageOriginalName = (agentId: string): string => `${agentId}.png`;

  toChatMessageAttachmentFileKey = (chatMessageId: string): string =>
    `chat-message/${chatMessageId}/attachment-${DateTime.now().toMillis()}`;

  toAgentToolFileKey = (organizationId: string, agentId: string): string =>
    `${organizationId}/agents/${agentId}/tools/${DateTime.now().toMillis()}`;
}
