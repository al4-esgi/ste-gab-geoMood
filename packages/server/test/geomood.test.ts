import { Test } from '@nestjs/testing'
import { validate } from 'class-validator'
import { MemoryStoredFile } from 'nestjs-form-data'
import { beforeAll, beforeEach, describe, expect, it, test } from 'vitest'
import { CreateMoodDto } from '../src/infrastructure/dto/request/create-mood.dto'
import { LocationDto } from '../src/infrastructure/dto/request/location.dto'
import { IWeatherPort } from '../src/ports/out/weather.port'
import { TestModule } from './mocks/test.module'

describe('Mood Service', () => {
  let weatherAdapter: IWeatherPort
  const mockCreateMoodDto = new CreateMoodDto()
  const mockLocationDto = new LocationDto()

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [TestModule],
    }).compile()
    weatherAdapter = module.get<IWeatherPort>('IWeatherPort')
  })

  beforeEach(async () => {
    mockCreateMoodDto.textContent = 'I feel happy'
    mockCreateMoodDto.rating = 4
    mockCreateMoodDto.email = 'email@gmail.com'
    mockLocationDto.lat = 40
    mockLocationDto.lng = -70
    mockCreateMoodDto.location = mockLocationDto
    const validFile = new MemoryStoredFile()
    validFile.originalName = 'photo.jpg'
    validFile.setFileTypeResult({ ext: 'jpg', mime: 'image/jpeg' })
    validFile.size = 1024

    validFile.buffer = Buffer.from('test')
    mockCreateMoodDto.picture = validFile
  })

  it('should be defined', () => {
    expect(weatherAdapter).toBeDefined()
  })

  describe('User Input Validation', () => {
    test('should accept valid mood data', async () => {
      expect(await validate(mockCreateMoodDto)).toHaveLength(0)
    })

    test('should reject invalid text', async () => {
      const invalidTexts = ['', '  ', 'a'.repeat(1001)]
      for (const text of invalidTexts) {
        mockCreateMoodDto.textContent = text.trim()
        const errors = await validate(mockCreateMoodDto)
        expect(errors.length).toBeGreaterThan(0)
        expect(errors[0].property).toBe('textContent')
      }
    })

    test('should reject invalid ratings', async () => {
      const invalidRatings = [0, 6, 3.5, -1]
      for (const rating of invalidRatings) {
        mockCreateMoodDto.rating = rating
        const errors = await validate(mockCreateMoodDto)
        expect(errors.length).toBeGreaterThan(0)
        expect(errors[0].property).toBe('rating')
      }
    })

    test('should accept valid ratings 1-5', async () => {
      for (const rating of [1, 2, 3, 4, 5]) {
        mockCreateMoodDto.rating = rating
        expect(await validate(mockCreateMoodDto)).toHaveLength(0)
      }
    })

    test('should validate image file', async () => {
      expect(await validate(mockCreateMoodDto)).toHaveLength(0)
    })

    test('should reject invalid image files', async () => {
      const invalidFile1 = new MemoryStoredFile()
      invalidFile1.originalName = 'doc.pdf'
      invalidFile1.setFileTypeResult({
        ext: 'pdf',
        mime: 'application/pdf',
      })
      invalidFile1.size = 1024
      invalidFile1.buffer = Buffer.from('test')
      const invalidFile2 = new MemoryStoredFile()
      invalidFile2.originalName = 'huge.jpg'
      invalidFile2.setFileTypeResult({
        ext: 'jpg',
        mime: 'image/jpeg',
      })
      invalidFile2.size = 10 * 1024 * 1024 * 10
      invalidFile2.buffer = Buffer.from('test')

      for (const file of [invalidFile1, invalidFile2]) {
        mockCreateMoodDto.picture = file
        const errors = await validate(mockCreateMoodDto)
        expect(errors.length).toBeGreaterThan(0)
      }
    })

    test('should allow mood without image', async () => {
      mockCreateMoodDto.picture = undefined
      expect(await validate(mockCreateMoodDto)).toHaveLength(0)
    })

    test('should report multiple errors', async () => {
      const invalidFile1 = new MemoryStoredFile()
      invalidFile1.originalName = 'doc.pdf'
      invalidFile1.setFileTypeResult({
        ext: 'pdf',
        mime: 'application/pdf',
      })
      invalidFile1.size = 1024
      invalidFile1.buffer = Buffer.from('test')

      mockCreateMoodDto.textContent = ''
      mockCreateMoodDto.rating = 0
      mockLocationDto.lat = 100
      mockLocationDto.lng = -200
      mockCreateMoodDto.location = mockLocationDto
      mockCreateMoodDto.picture = invalidFile1
      const errors = await validate(mockCreateMoodDto)
      expect(errors.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('Weather Services', () => {
    test('should fetch weather data for coordinates', async () => {
      await expect(weatherAdapter.fetchWeatherData(43.296398, 5.37)).resolves.toBeDefined()
    })
    test('should handle weather API failure', async () => {
      expect(weatherAdapter.handleApiFailure()).toBeDefined()
    })
  })
})
