import { exit } from "node:process";
import { Logger } from "@nestjs/common";
import { plainToInstance, Type } from "class-transformer";
import {
  IsNumber,
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

export class WeatherConfig {
  @IsString()
  WHEATHER_API_KEY: string;
}

export class GeminiConfig {
  @IsString()
  GEMINI_API_KEY: string;
}

export class ServerConfig {
  @IsString()
  PORT: string

  @IsString()
  NODE_ENV: string;
}

export class EnvironmentVariables {
  @ValidateNested()
  @Type(() => DatabaseConfig)
  DATABASE: DatabaseConfig

  @ValidateNested()
  @Type(() => ServerConfig)
  SERVER: ServerConfig;

  @ValidateNested()
  @Type(() => WeatherConfig)
  Weather: WeatherConfig;

  @ValidateNested()
  @Type(() => GeminiConfig)
  GEMINI: GeminiConfig;
}

export function validateEnv(config: Record<string, unknown>) {
  const structuredConfig = {
    DATABASE: {
      DATABASE_URL: config.DATABASE_URL,
      DATABASE_NAME: config.DATABASE_NAME,
    },
    SERVER: {
      PORT: config.PORT,
      NODE_ENV: config.NODE_ENV,
    },
    Weather: {
      WHEATHER_API_KEY: config.WHEATHER_API_KEY,
    },
    GEMINI: {
      GEMINI_API_KEY: config.GEMINI_API_KEY,
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
    skipMissingProperties: false,
  });

  if (errors.length) {
    new Logger(validateEnv.name).error(errors.toString());
    exit();
  }

  return validatedConfig;
}
