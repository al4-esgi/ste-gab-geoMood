import { exit } from "node:process";
import { Logger } from "@nestjs/common";
import { plainToInstance, Type } from "class-transformer";
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  validateSync,
} from "class-validator";

export class DatabaseConfig {
  @IsString()
  DATABASE_URL: string;

  @IsString()
  DATABASE_NAME: string;
}

export class MinioConfig {
  @IsString()
  MINIO_ENDPOINT: string;

  @IsOptional()
  @IsNumber()
  MINIO_PORT?: number;

  @IsString()
  MINIO_ACCESS_KEY: string;

  @IsString()
  MINIO_SECRET_KEY: string;

  @IsString()
  MINIO_BUCKET_NAME: string;
}

export class WeatherConfig {
  @IsString()
  WHEATHER_API_KEY: string;
}

export class ServerConfig {
  @IsNumber()
  PORT: number;

  @IsString()
  NODE_ENV: string;
}

export class EnvironmentVariables {
  @ValidateNested()
  @Type(() => DatabaseConfig)
  DATABASE: DatabaseConfig;

  @ValidateNested()
  @Type(() => MinioConfig)
  MINIO: MinioConfig;

  @ValidateNested()
  @Type(() => ServerConfig)
  SERVER: ServerConfig;

  @ValidateNested()
  @Type(() => WeatherConfig)
  Weather: WeatherConfig;
}

export function validateEnv(config: Record<string, unknown>) {
  const structuredConfig = {
    DATABASE: {
      DATABASE_URL: config.DATABASE_URL,
      DATABASE_NAME: config.DATABASE_NAME,
    },
    MINIO: {
      MINIO_ENDPOINT: config.MINIO_ENDPOINT,
      MINIO_PORT: config.MINIO_PORT || undefined,
      MINIO_ACCESS_KEY: config.MINIO_ACCESS_KEY,
      MINIO_SECRET_KEY: config.MINIO_SECRET_KEY,
      MINIO_BUCKET_NAME: config.MINIO_BUCKET_NAME,
    },
    SERVER: {
      PORT: config.PORT,
      NODE_ENV: config.NODE_ENV,
    },
    Weather: {
      WHEATHER_API_KEY: config.WHEATHER_API_KEY,
    },
  };

  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    structuredConfig,
    {
      enableImplicitConversion: true,
    }
  );

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: true,
  });

  if (errors.length) {
    new Logger(validateEnv.name).error(errors.toString());
    exit();
  }

  return validatedConfig;
}
