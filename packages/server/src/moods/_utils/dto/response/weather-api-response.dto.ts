export class WeatherConditionDto {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export class CurrentWeatherDto {
  dt: number;
  sunrise: number;
  sunset: number;
  temp: number;
  feels_like: number;
  pressure: number;
  humidity: number;
  dew_point: number;
  uvi: number;
  clouds: number;
  visibility: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust?: number;
  weather: WeatherConditionDto[];
}

export class MinutelyWeatherDto {
  dt: number;
  precipitation: number;
}

export class HourlyWeatherDto {
  dt: number;
  temp: number;
  feels_like: number;
  pressure: number;
  humidity: number;
  dew_point: number;
  uvi: number;
  clouds: number;
  visibility: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust?: number;
  weather: WeatherConditionDto[];
  pop?: number;
}

export class DailyTempDto {
  day: number;
  min: number;
  max: number;
  night: number;
  eve: number;
  morn: number;
}

export class DailyFeelsLikeDto {
  day: number;
  night: number;
  eve: number;
  morn: number;
}

export class DailyWeatherDto {
  dt: number;
  sunrise: number;
  sunset: number;
  moonrise: number;
  moonset: number;
  moon_phase: number;
  summary?: string;
  temp: DailyTempDto;
  feels_like: DailyFeelsLikeDto;
  pressure: number;
  humidity: number;
  dew_point: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust?: number;
  weather: WeatherConditionDto[];
  clouds: number;
  pop?: number;
  rain?: number;
  uvi: number;
}

export class WeatherAlertDto {
  sender_name: string;
  event: string;
  start: number;
  end: number;
  description: string;
  tags: string[];
}

export class WeatherApiResponseDto {
  lat: number;
  lon: number;
  timezone: string;
  timezone_offset: number;
  current: CurrentWeatherDto;
  minutely: MinutelyWeatherDto[];
  hourly: HourlyWeatherDto[];
  daily: DailyWeatherDto[];
  alerts?: WeatherAlertDto[];
}
