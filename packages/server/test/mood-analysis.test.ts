import { HttpModule, HttpService } from '@nestjs/axios'
import { ConfigModule } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { validateEnv } from '../src/_utils/config/env.config'
import { AnalysisRating, MoodRating } from '../src/_utils/types/mood-rating'
import { CurrentWeatherDto, WeatherApiResponseDto } from '../src/moods/dto/response/weather-api-response.dto'
import { MoodsService } from '../src/moods/moods.service'

/*
### 2. Mood Analysis

- Calculate MoodScore combining:
    - user text and rating,
    - real weather data,
    - and, if possible, AI analysis (Vision API or Natural Language API).

💡 If AI integration is not possible, a dictionary or simple rule can replace the analysis.
*/

describe('Mood Analysis', () => {
  let moodService: MoodsService
  let httpService: HttpService
  const validRatings = [1, 2, 3, 4, 5]

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule,
        ConfigModule.forRoot({
          validate: validateEnv,
          isGlobal: true,
          envFilePath: ['.env.development', '.env'],
        }),
      ],
      providers: [MoodsService],
    }).compile()
    moodService = module.get(MoodsService)
    httpService = module.get(HttpService)
  })

  describe(
    'Text Sentiment Analysis',
    () => {
      const positiveUserInput = "Je me sens bien aujourd'hui"
      const negativeUserInput = "Je me sens mal aujourd'hui"
      const neutralUserInput = 'rien de spécial'

      test('should analyze positive sentiment from positive text', async () => {
        const sentimentAnalysis = await moodService.getTextSentimentAnalysis(positiveUserInput)
        expect(sentimentAnalysis).toBeGreaterThanOrEqual(3)
      })

      test('should analyze negative sentiment from negative text', async () => {
        const sentimentAnalysis = await moodService.getTextSentimentAnalysis(negativeUserInput)
        expect(sentimentAnalysis).toBeLessThan(4)
      })

      test('should analyze neutral sentiment from neutral text', async () => {
        const sentimentAnalysis = await moodService.getTextSentimentAnalysis(neutralUserInput)
        expect(sentimentAnalysis).toBeLessThanOrEqual(4)
        expect(sentimentAnalysis).toBeGreaterThanOrEqual(2)
      })

      test('handle ApPI error and return a fake value', async () => {
        vi.spyOn(httpService.axiosRef, 'get').mockRejectedValueOnce(new Error('API is down'))

        const result = await moodService.getTextSentimentAnalysis(neutralUserInput)

        expect(result).toBeDefined()
        expect(validRatings).toContain(result)
      })
    },
    { timeout: 300000 },
  )

  describe('MoodRating', () => {
    let rating: MoodRating

    beforeEach(() => {
      rating = new MoodRating(3, 3, 3, 3)
    })

    test('should accept valid weights that sum to 1.0', () => {
      expect(() => {
        rating.setWeight({
          ratingUserTextInput: 0.4,
          ratingUserNumberInput: 0.3,
          ratingPhotoAnalysis: 0.2,
          ratingWeather: 0.1,
        })
      }).not.toThrow()
    })

    test('should reject weights that sum to less than 1.0', () => {
      expect(() => {
        rating.setWeight({
          ratingUserTextInput: 0.2,
          ratingUserNumberInput: 0.2,
          ratingPhotoAnalysis: 0.2,
          ratingWeather: 0.2,
        })
      }).toThrow('Weight sum must equal 1.0')
    })

    test('should reject weights that sum to more than 1.0', () => {
      expect(() => {
        rating.setWeight({
          ratingUserTextInput: 0.3,
          ratingUserNumberInput: 0.3,
          ratingPhotoAnalysis: 0.3,
          ratingWeather: 0.3,
        })
      }).toThrow('Weight sum must equal 1.0')
    })

    test('should accept weights with floating-point errors', () => {
      expect(() => {
        rating.setWeight({
          ratingUserTextInput: 0.1,
          ratingUserNumberInput: 0.2,
          ratingPhotoAnalysis: 0.3,
          ratingWeather: 0.4,
        })
      }).not.toThrow()
    })

    test('should calculate weighted average with default weights (25% each)', () => {
      rating = new MoodRating(4, 5, 3, 2)
      expect(rating.total).toBe(3.5)
    })

    test('should return 5.0 when all ratings are 5', () => {
      rating = new MoodRating(5, 5, 5, 5)
      expect(rating.total).toBe(5.0)
    })

    test('should return 1.0 when all ratings are 1', () => {
      rating = new MoodRating(1, 1, 1, 1)
      expect(rating.total).toBe(1.0)
    })

    test('should calculate correctly with custom weights', () => {
      rating = new MoodRating(4, 5, 3, 2)
      rating.setWeight({
        ratingUserTextInput: 0.5,
        ratingUserNumberInput: 0.3,
        ratingPhotoAnalysis: 0.1,
        ratingWeather: 0.1,
      })
      expect(rating.total).toBe(4.0)
    })

    test('should automatically adjust weights when no photo provided', () => {
      const rating = new MoodRating(4, 5, 2, 0)

      expect(rating.weight.ratingPhotoAnalysis).toBe(0)
      expect(rating.weight.ratingUserTextInput).toBeCloseTo(0.33, 2)
      expect(rating.weight.ratingUserNumberInput).toBeCloseTo(0.34, 2)
      expect(rating.weight.ratingWeather).toBeCloseTo(0.33, 2)

      expect(rating.total).toBeCloseTo(3.68, 2)
    })
  })

  describe('Weather Score', () => {
    test('should return high score (4-5) for sunny and warm weather', () => {
      const sunnyWeather = new WeatherApiResponseDto()
      sunnyWeather.current = {
        temp: 295,
        clouds: 10,
        weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
        wind_speed: 3,
      } as CurrentWeatherDto

      const score = moodService.getAnalysisRatingFromWeather(sunnyWeather)

      expect(validRatings).toContain(score)
      expect(score).toBeGreaterThanOrEqual(4)
    })

    test('should return low score (1-2) for rainy and cold weather', () => {
      const rainyWeather = new WeatherApiResponseDto()
      rainyWeather.current = {
        temp: 278,
        clouds: 90,
        weather: [{ main: 'Rain', description: 'light rain', icon: '10d' }],
        wind_speed: 8,
      } as CurrentWeatherDto

      const score = moodService.getAnalysisRatingFromWeather(rainyWeather)

      expect(validRatings).toContain(score)
      expect(score).toBeLessThanOrEqual(2)
    })

    test('should return neutral score (3) for cloudy but mild weather', () => {
      const cloudyWeather = new WeatherApiResponseDto()
      cloudyWeather.current = {
        temp: 288,
        clouds: 50,
        weather: [{ main: 'Clouds', description: 'scattered clouds', icon: '03d' }],
        wind_speed: 5,
      } as CurrentWeatherDto

      const score = moodService.getAnalysisRatingFromWeather(cloudyWeather)

      expect(validRatings).toContain(score)
      expect(score).toBe(3)
    })

    test('should penalize stormy weather with very low score', () => {
      const stormyWeather = new WeatherApiResponseDto()
      stormyWeather.current = {
        temp: 290,
        clouds: 100,
        weather: [{ main: 'Thunderstorm', description: 'thunderstorm', icon: '11d' }],
        wind_speed: 15,
      } as CurrentWeatherDto

      const score = moodService.getAnalysisRatingFromWeather(stormyWeather)

      expect(validRatings).toContain(score)
      expect(score).toBeLessThanOrEqual(2)
    })

    test('should handle extreme temperatures (very hot)', () => {
      const hotWeather = new WeatherApiResponseDto()
      hotWeather.current = {
        temp: 310,
        clouds: 0,
        weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
        wind_speed: 2,
      } as CurrentWeatherDto

      const score = moodService.getAnalysisRatingFromWeather(hotWeather)

      expect(validRatings).toContain(score)
      expect(score).toBeLessThan(5)
    })

    test('should handle extreme temperatures (very cold)', () => {
      const coldWeather = new WeatherApiResponseDto()
      coldWeather.current = {
        temp: 263,
        clouds: 20,
        weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
        wind_speed: 3,
      } as CurrentWeatherDto

      const score = moodService.getAnalysisRatingFromWeather(coldWeather)

      expect(validRatings).toContain(score)
      expect(score).toBeLessThan(5)
    })

    test('should always return a value between 0 and 5', () => {
      const extremeWeather = new WeatherApiResponseDto()
      extremeWeather.current = {
        temp: 250,
        clouds: 100,
        weather: [{ main: 'Thunderstorm', description: 'heavy thunderstorm', icon: '11d' }],
        wind_speed: 25,
      } as CurrentWeatherDto

      const score = moodService.getAnalysisRatingFromWeather(extremeWeather)

      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(5)
      expect(Number.isInteger(score)).toBe(true)
    })

    test('should handle missing weather data gracefully', () => {
      const emptyWeather = new WeatherApiResponseDto()

      const score = moodService.getAnalysisRatingFromWeather(emptyWeather)

      expect(validRatings).toContain(score)
      expect(score).toBe(3)
    })
  })

  describe('Calculation Score', () => {
    test('should calculate final score from user rating, text sentiment, picture analysis, and weather data', () => {
      const userSentiment: AnalysisRating = 5
      const userRating: AnalysisRating = 5
      const weatherRating: AnalysisRating = 4
      const photoRating: AnalysisRating = 4

      const moodRating = moodService.createMoodScore(userSentiment, userRating, weatherRating, photoRating)

      expect(moodRating).toBeInstanceOf(MoodRating)
      expect(moodRating.ratingUserNumberInput).toBe(5)
      expect(moodRating.ratingWeather).toBe(4)
      expect(moodRating.ratingPhotoAnalysis).toBe(4)

      expect([3, 4, 5]).toContain(moodRating.ratingUserTextInput)
      expect(moodRating.total).toBeGreaterThan(0)
      expect(moodRating.total).toBeLessThanOrEqual(5)
    })

    test('should work without photo (optional parameter)', () => {
      const userSentiment: AnalysisRating = 3
      const userRating: AnalysisRating = 3
      const weatherRating: AnalysisRating = 3

      const moodRating = moodService.createMoodScore(userSentiment, userRating, weatherRating, undefined)

      expect(moodRating).toBeInstanceOf(MoodRating)
      expect(moodRating.ratingPhotoAnalysis).toBe(0)

      expect(moodRating.weight.ratingPhotoAnalysis).toBe(0)
      expect(
        moodRating.weight.ratingUserTextInput +
          moodRating.weight.ratingUserNumberInput +
          moodRating.weight.ratingWeather,
      ).toBeCloseTo(1.0, 2)
    })

    test('should handle all-positive scenario (best mood)', () => {
      const moodRating = moodService.createMoodScore(5, 5, 5, 5)

      expect(moodRating).toBeInstanceOf(MoodRating)
      expect(moodRating.total).toBeGreaterThan(4.5)
      expect(moodRating.total).toBeLessThanOrEqual(5)
    })

    test('should handle all-negative scenario (worst mood)', () => {
      const moodRating = moodService.createMoodScore(1, 1, 1, 1)

      expect(moodRating).toBeInstanceOf(MoodRating)
      expect(moodRating.total).toBeLessThan(2)
      expect(moodRating.total).toBeGreaterThanOrEqual(0)
    })

    test('should handle mixed ratings correctly', () => {
      const moodRating = moodService.createMoodScore(5, 5, 1, undefined)

      expect(moodRating).toBeInstanceOf(MoodRating)
      expect(moodRating.total).toBeGreaterThan(2)
      expect(moodRating.total).toBeLessThan(5)
    })

    test('should throw error for invalid user rating (too low)', () => {
      expect(() => {
        moodService.createMoodScore(3, 0, 3, 3)
      }).toThrow('User rating must be between 1 and 5')
    })

    test('should throw error for invalid user rating (too high)', () => {
      expect(() => {
        moodService.createMoodScore(3, 6 as AnalysisRating, 3, 3)
      }).toThrow('User rating must be between 1 and 5')
    })

    test('should throw error for invalid weather rating', () => {
      expect(() => {
        moodService.createMoodScore(3, 3, 10 as AnalysisRating, 3)
      }).toThrow()
    })
  })
})
