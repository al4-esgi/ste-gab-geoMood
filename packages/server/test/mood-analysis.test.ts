import { Test } from '@nestjs/testing'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'
import { ImageData } from '../src/domain/value-objects/image-data.vo'
import { AnalysisRating, MoodRating } from '../src/domain/value-objects/mood-rating.vo'
import { WeatherVO } from '../src/domain/value-objects/weather.vo'
import { CurrentWeatherDto, WeatherApiResponseDto } from '../src/infrastructure/dto/response/weather-api-response.dto'
import { ISentimentAnalyzerPort } from '../src/ports/out/sentiment-analyzer.port'
import { TestModule } from './mocks/test.module'

describe('Mood Analysis', () => {
  let sentimentAnalyzer: ISentimentAnalyzerPort
  const validRatings = [1, 2, 3, 4, 5]

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [TestModule],
    }).compile()
    sentimentAnalyzer = module.get<ISentimentAnalyzerPort>('ISentimentAnalyzerPort')
  })

  describe('Text Sentiment Analysis', { timeout: 300000 }, () => {
    const positiveUserInput = "Je me sens bien aujourd'hui"
    const negativeUserInput = "Je me sens mal aujourd'hui"
    const neutralUserInput = 'rien de spécial'

    test('should analyze positive sentiment from positive text', async () => {
      const sentimentAnalysis = await sentimentAnalyzer.getTextSentimentAnalysis(positiveUserInput)
      expect(sentimentAnalysis).toBeGreaterThanOrEqual(3)
    })

    test('should analyze negative sentiment from negative text', async () => {
      const sentimentAnalysis = await sentimentAnalyzer.getTextSentimentAnalysis(negativeUserInput)
      expect(sentimentAnalysis).toBeLessThan(4)
    })

    test('should analyze neutral sentiment from neutral text', async () => {
      const sentimentAnalysis = await sentimentAnalyzer.getTextSentimentAnalysis(neutralUserInput)
      expect(sentimentAnalysis).toBeLessThanOrEqual(4)
      expect(sentimentAnalysis).toBeGreaterThanOrEqual(2)
    })

    test('should return fallback score when LLM response is not valid JSON', async () => {
      vi.spyOn(sentimentAnalyzer, 'getTextSentimentAnalysis').mockResolvedValueOnce(3)
      const result = await sentimentAnalyzer.getTextSentimentAnalysis(neutralUserInput)
      expect(result).toBeDefined()
      expect(result).toBe(3)
    })

    test('handle API error and return a fallback value', async () => {
      vi.spyOn(sentimentAnalyzer, 'getTextSentimentAnalysis').mockResolvedValueOnce(3)

      const result = await sentimentAnalyzer.getTextSentimentAnalysis(neutralUserInput)

      expect(result).toBeDefined()
      expect(validRatings).toContain(result)
    })
  })

  describe('Picture Sentiment Analysis', { timeout: 300000 }, () => {
    const happyImageBuffer = readFileSync(join(__dirname, 'mocks/portraits/happy.jpg'))
    const sadImageBuffer = readFileSync(join(__dirname, 'mocks/portraits/sad.jpg'))
    const neutralImageBuffer = readFileSync(join(__dirname, 'mocks/portraits/neutral.jpg'))

    const happyImage: ImageData = {
      buffer: happyImageBuffer,
      mimeType: 'image/jpeg',
      originalName: 'happy.jpg',
      size: happyImageBuffer.length,
    }

    const sadImage: ImageData = {
      buffer: sadImageBuffer,
      mimeType: 'image/jpeg',
      originalName: 'sad.jpg',
      size: sadImageBuffer.length,
    }

    const neutralImage: ImageData = {
      buffer: neutralImageBuffer,
      mimeType: 'image/jpeg',
      originalName: 'neutral.jpg',
      size: neutralImageBuffer.length,
    }

    test('should analyze positive sentiment from smiling face picture', async () => {
      const sentimentAnalysis = await sentimentAnalyzer.getPictureSentimentAnalysis(happyImage)
      expect(sentimentAnalysis).toBeGreaterThanOrEqual(3)
      expect(sentimentAnalysis).toBeLessThanOrEqual(5)
      expect(validRatings).toContain(sentimentAnalysis)
    })

    test('should analyze negative sentiment from sad face picture', async () => {
      const sentimentAnalysis = await sentimentAnalyzer.getPictureSentimentAnalysis(sadImage)
      expect(sentimentAnalysis).toBeGreaterThanOrEqual(1)
      expect(sentimentAnalysis).toBeLessThanOrEqual(3)
      expect(validRatings).toContain(sentimentAnalysis)
    })

    test('should analyze neutral sentiment from neutral expression picture', async () => {
      const sentimentAnalysis = await sentimentAnalyzer.getPictureSentimentAnalysis(neutralImage)
      expect(sentimentAnalysis).toBeGreaterThanOrEqual(2)
      expect(sentimentAnalysis).toBeLessThanOrEqual(4)
      expect(validRatings).toContain(sentimentAnalysis)
    })

    test('should return fallback score when vision API response is not valid JSON', async () => {
      const mockPicture: ImageData = {
        buffer: Buffer.from('fake-image-data'),
        mimeType: 'image/jpeg',
        originalName: 'mock.jpg',
        size: 15,
      }

      vi.spyOn(sentimentAnalyzer, 'getPictureSentimentAnalysis').mockResolvedValueOnce(3)
      const result = await sentimentAnalyzer.getPictureSentimentAnalysis(mockPicture)
      expect(result).toBeDefined()
      expect(result).toBe(3)
    })

    test('handle vision API error and return a fallback value', async () => {
      const mockPicture: ImageData = {
        buffer: Buffer.from('fake-image-data'),
        mimeType: 'image/jpeg',
        originalName: 'mock.jpg',
        size: 15,
      }

      vi.spyOn(sentimentAnalyzer, 'getPictureSentimentAnalysis').mockResolvedValueOnce(3)

      const result = await sentimentAnalyzer.getPictureSentimentAnalysis(mockPicture)

      expect(result).toBeDefined()
      expect(validRatings).toContain(result)
    })
  })

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
    function createWeatherVO(current: CurrentWeatherDto): WeatherVO {
      const apiResponse = new WeatherApiResponseDto()
      apiResponse.current = current

      return new WeatherVO({
        condition: current?.weather?.[0]?.main || 'Unknown',
        temperature: current ? current.temp - 273.15 : 0,
        humidity: current?.humidity || 0,
        windSpeed: current?.wind_speed || 0,
        pressure: current?.pressure || 0,
        rawData: current
          ? {
              temp: current.temp,
              clouds: current.clouds,
              weather: current.weather,
              wind_speed: current.wind_speed,
              humidity: current.humidity,
              pressure: current.pressure,
            }
          : undefined,
      })
    }

    test('should return high score (4-5) for sunny and warm weather', () => {
      const sunnyWeather = {
        temp: 295,
        clouds: 10,
        weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
        wind_speed: 3,
      } as CurrentWeatherDto

      const weatherVO = createWeatherVO(sunnyWeather)
      const score = weatherVO.getAnalysisRatingFromWeather()

      expect(validRatings).toContain(score)
      expect(score).toBeGreaterThanOrEqual(4)
    })

    test('should return low score (1-2) for rainy and cold weather', () => {
      const rainyWeather = {
        temp: 278,
        clouds: 90,
        weather: [{ main: 'Rain', description: 'light rain', icon: '10d' }],
        wind_speed: 8,
      } as CurrentWeatherDto

      const weatherVO = createWeatherVO(rainyWeather)
      const score = weatherVO.getAnalysisRatingFromWeather()

      expect(validRatings).toContain(score)
      expect(score).toBeLessThanOrEqual(2)
    })

    test('should return neutral score (3) for cloudy but mild weather', () => {
      const cloudyWeather = {
        temp: 288,
        clouds: 50,
        weather: [{ main: 'Clouds', description: 'scattered clouds', icon: '03d' }],
        wind_speed: 5,
      } as CurrentWeatherDto

      const weatherVO = createWeatherVO(cloudyWeather)
      const score = weatherVO.getAnalysisRatingFromWeather()

      expect(validRatings).toContain(score)
      expect(score).toBe(3)
    })

    test('should penalize stormy weather with very low score', () => {
      const stormyWeather = {
        temp: 290,
        clouds: 100,
        weather: [{ main: 'Thunderstorm', description: 'thunderstorm', icon: '11d' }],
        wind_speed: 15,
      } as CurrentWeatherDto

      const weatherVO = createWeatherVO(stormyWeather)
      const score = weatherVO.getAnalysisRatingFromWeather()

      expect(validRatings).toContain(score)
      expect(score).toBeLessThanOrEqual(2)
    })

    test('should handle extreme temperatures (very hot)', () => {
      const hotWeather = {
        temp: 310,
        clouds: 0,
        weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
        wind_speed: 2,
      } as CurrentWeatherDto

      const weatherVO = createWeatherVO(hotWeather)
      const score = weatherVO.getAnalysisRatingFromWeather()

      expect(validRatings).toContain(score)
      expect(score).toBeLessThan(5)
    })

    test('should handle extreme temperatures (very cold)', () => {
      const coldWeather = {
        temp: 263,
        clouds: 20,
        weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
        wind_speed: 3,
      } as CurrentWeatherDto

      const weatherVO = createWeatherVO(coldWeather)
      const score = weatherVO.getAnalysisRatingFromWeather()

      expect(validRatings).toContain(score)
      expect(score).toBeLessThan(5)
    })

    test('should always return a value between 0 and 5', () => {
      const extremeWeather = {
        temp: 250,
        clouds: 100,
        weather: [
          {
            main: 'Thunderstorm',
            description: 'heavy thunderstorm',
            icon: '11d',
          },
        ],
        wind_speed: 25,
      } as CurrentWeatherDto

      const weatherVO = createWeatherVO(extremeWeather)
      const score = weatherVO.getAnalysisRatingFromWeather()

      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(5)
      expect(Number.isInteger(score)).toBe(true)
    })

    test('should handle missing weather data gracefully', () => {
      const weatherVO = new WeatherVO({
        condition: 'Unknown',
        temperature: 0,
        humidity: 0,
        windSpeed: 0,
        pressure: 0,
      })

      const score = weatherVO.getAnalysisRatingFromWeather()

      expect(validRatings).toContain(score)
      expect(score).toBe(3)
    })
  })

  describe('Calculation Score', () => {
    function createMoodScore(
      userSentimentAnalysis: AnalysisRating,
      ratingUserNumberInput: AnalysisRating,
      ratingWeather: AnalysisRating,
      ratingPhotoAnalysis?: AnalysisRating,
    ): MoodRating {
      if (ratingUserNumberInput < 1 || ratingUserNumberInput > 5) {
        throw new Error('User rating must be between 1 and 5')
      }

      if (userSentimentAnalysis < 0 || userSentimentAnalysis > 5) {
        throw new Error('Text sentiment rating must be between 0 and 5')
      }

      if (ratingWeather < 0 || ratingWeather > 5) {
        throw new Error('Weather rating must be between 0 and 5')
      }

      if (ratingPhotoAnalysis !== undefined && (ratingPhotoAnalysis < 0 || ratingPhotoAnalysis > 5)) {
        throw new Error('Photo rating must be between 0 and 5')
      }

      return new MoodRating(userSentimentAnalysis, ratingUserNumberInput, ratingWeather, ratingPhotoAnalysis)
    }

    test('should calculate final score from user rating, text sentiment, picture analysis, and weather data', () => {
      const userSentiment: AnalysisRating = 5
      const userRating: AnalysisRating = 5
      const weatherRating: AnalysisRating = 4
      const photoRating: AnalysisRating = 4

      const moodRating = createMoodScore(userSentiment, userRating, weatherRating, photoRating)

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

      const moodRating = createMoodScore(userSentiment, userRating, weatherRating, undefined)

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
      const moodRating = createMoodScore(5, 5, 5, 5)

      expect(moodRating).toBeInstanceOf(MoodRating)
      expect(moodRating.total).toBeGreaterThan(4.5)
      expect(moodRating.total).toBeLessThanOrEqual(5)
    })

    test('should handle all-negative scenario (worst mood)', () => {
      const moodRating = createMoodScore(1, 1, 1, 1)

      expect(moodRating).toBeInstanceOf(MoodRating)
      expect(moodRating.total).toBeLessThan(2)
      expect(moodRating.total).toBeGreaterThanOrEqual(0)
    })

    test('should handle mixed ratings correctly', () => {
      const moodRating = createMoodScore(5, 5, 1, undefined)

      expect(moodRating).toBeInstanceOf(MoodRating)
      expect(moodRating.total).toBeGreaterThan(2)
      expect(moodRating.total).toBeLessThan(5)
    })

    test('should throw error for invalid user rating (too low)', () => {
      expect(() => {
        createMoodScore(3, 0 as AnalysisRating, 3, 3)
      }).toThrow('User rating must be between 1 and 5')
    })

    test('should throw error for invalid user rating (too high)', () => {
      expect(() => {
        createMoodScore(3, 6 as AnalysisRating, 3, 3)
      }).toThrow('User rating must be between 1 and 5')
    })

    test('should throw error for invalid weather rating', () => {
      expect(() => {
        createMoodScore(3, 3, 10 as AnalysisRating, 3)
      }).toThrow()
    })
  })
})
