import { Logger, Provider } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Client } from 'minio'
import { EnvironmentVariables } from 'src/_utils/config/env.config'
import { MINIO_CLIENT_TOKEN } from 'src/_utils/constants'

export const minioProviders: Provider[] = [
  {
    provide: MINIO_CLIENT_TOKEN,
    useFactory: async (configService: ConfigService<EnvironmentVariables, true>): Promise<Client> => {
      const logger = new Logger(MINIO_CLIENT_TOKEN)
      const minioConfig = configService.get('MINIO')
      const serverConfig = configService.get('SERVER')
      const isLocal = serverConfig.NODE_ENV === 'development'

      try {
        let endPoint = minioConfig.MINIO_ENDPOINT
        if (endPoint.startsWith('http://') || endPoint.startsWith('https://')) {
          const url = new URL(endPoint)
          endPoint = url.hostname
        }

        const minioClient = new Client({
          endPoint: endPoint,
          port: minioConfig.MINIO_PORT,
          useSSL: !isLocal,
          accessKey: minioConfig.MINIO_ACCESS_KEY,
          secretKey: minioConfig.MINIO_SECRET_KEY,
        })

        try {
          const bucketName = minioConfig.MINIO_BUCKET_NAME
          const bucketExists = await minioClient.bucketExists(bucketName)
          if (!bucketExists) {
            await minioClient.makeBucket(bucketName, 'eu-west-2')
          }
          logger.log('Minio client initialized successfully', MINIO_CLIENT_TOKEN)
        } catch (bucketError) {
          logger.warn(
            `Minio bucket initialization failed, but client created: ${bucketError.message}`,
            MINIO_CLIENT_TOKEN,
          )
        }

        return minioClient
      } catch (error) {
        logger.error(`Failed to initialize Minio client, ${error.message}`, MINIO_CLIENT_TOKEN)
        throw error
      }
    },
    inject: [ConfigService],
  },
]
