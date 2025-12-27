import 'reflect-metadata'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import type { NestExpressApplication } from '@nestjs/platform-express'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { useContainer } from 'class-validator'
import { EnvironmentVariables, ServerConfig } from './infrastructure/config/env.config'
import SwaggerCustomOptionsConfig from './infrastructure/config/swagger-custom-options.config'
import ValidationPipeOptionsConfig from './infrastructure/config/validation-pipe-options.config'
import { MongoDBExceptionFilter } from './infrastructure/filters/mongo-exception.filter'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  useContainer(app.select(AppModule), { fallbackOnErrors: true })

  app
    .setGlobalPrefix('api/v1')
    .useGlobalFilters(new MongoDBExceptionFilter())
    .useGlobalPipes(new ValidationPipe(ValidationPipeOptionsConfig))
    .enableCors()

  app.set('query parser', 'extended')

  const config = new DocumentBuilder()
    .setTitle('Geo MoodMap')
    .setDescription('Routes description of the GeoMoodMap API')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/doc', app, document, SwaggerCustomOptionsConfig)

  const configService = app.get(ConfigService<EnvironmentVariables, true>)
  return app.listen(configService.get<ServerConfig>('SERVER').PORT)
}

void bootstrap()
