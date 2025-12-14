import { INestApplication } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { Test, TestingModule } from '@nestjs/testing'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import * as request from 'supertest'
import { validateEnv } from '../src/_utils/config/env.config'
import { UsersModule } from '../src/users/users.module'
import { UsersRepository } from '../src/users/users.repository'

/*
### API Routes Tests

- POST /auth/register - Register with name and email only
- POST /auth/login - Login with email only
- POST /moods - Submit mood entry with text, rating, location, weather
- GET /moods - Get user's moods
*/

describe('API Routes', () => {
  let app: INestApplication
  let module: TestingModule
  let usersRepository: UsersRepository
  let testUserEmail: string

  beforeEach(async () => {
    testUserEmail = `test${Date.now()}@example.com`

    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: ['.env'],
          validate: validateEnv,
        }),
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            uri: configService.get('DATABASE.DATABASE_URL'),
            dbName: `${configService.get('DATABASE.DATABASE_NAME')}_test`,
          }),
        }),
        UsersModule,
      ],
    }).compile()

    app = module.createNestApplication()
    await app.init()

    usersRepository = module.get<UsersRepository>(UsersRepository)
  })

  afterEach(async () => {
    // Clean up test user
    const user = await usersRepository.findUserByEmail(testUserEmail)
    if (user) {
      await usersRepository.deleteUser(user._id.toString())
    }
    await app.close()
  })

  describe('POST /auth/register', () => {
    it('should register user with name and email', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: testUserEmail,
        })
        .expect(201)

      expect(response.body).toBeDefined()
      expect(response.body.user).toBeDefined()
      expect(response.body.user.name).toBe('Test User')
      expect(response.body.user.email).toBe(testUserEmail)
      expect(response.body.user.moods).toBeDefined()
    })

    it('should return 400 if email is missing', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Test User',
        })
        .expect(400)
    })

    it('should return 400 if name is missing', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: testUserEmail,
        })
        .expect(400)
    })

    it('should return 409 if email already exists', async () => {
      // First registration
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: testUserEmail,
        })
        .expect(201)

      // Second registration with same email
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Another User',
          email: testUserEmail,
        })
        .expect(409)
    })
  })

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Create a user for login tests
      await usersRepository.createUser('Test User', testUserEmail)
    })

    it('should login with email only', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUserEmail,
        })
        .expect(200)

      expect(response.body).toBeDefined()
      expect(response.body.user).toBeDefined()
      expect(response.body.user.email).toBe(testUserEmail)
      expect(response.body.user.name).toBe('Test User')
    })

    it('should return 400 if email is missing', async () => {
      await request(app.getHttpServer()).post('/auth/login').send({}).expect(400)
    })

    it('should return 404 if user does not exist', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
        })
        .expect(404)
    })
  })

  describe('POST /moods', () => {
    let userId: string

    beforeEach(async () => {
      const user = await usersRepository.createUser('Test User', testUserEmail)
      userId = user._id.toString()
    })

    it('should submit mood with all required fields', async () => {
      const moodData = {
        userId,
        textContent: 'Feeling great today!',
        rating: 5,
        location: {
          lat: 40.7128,
          lng: -74.006,
        },
        weather: {
          temperature: 22,
          condition: 'Sunny',
          humidity: 60,
          pressure: 1013,
          windSpeed: 5,
        },
      }

      const response = await request(app.getHttpServer()).post('/moods').send(moodData).expect(201)

      expect(response.body).toBeDefined()
      expect(response.body.mood).toBeDefined()
      expect(response.body.mood.textContent).toBe('Feeling great today!')
      expect(response.body.mood.rating).toBe(5)
    })

    it('should return 400 if textContent is missing', async () => {
      await request(app.getHttpServer())
        .post('/moods')
        .send({
          userId,
          rating: 5,
          location: { lat: 40.7128, lng: -74.006 },
          weather: {
            temperature: 22,
            condition: 'Sunny',
            humidity: 60,
            pressure: 1013,
            windSpeed: 5,
          },
        })
        .expect(400)
    })

    it('should return 400 if rating is missing', async () => {
      await request(app.getHttpServer())
        .post('/moods')
        .send({
          userId,
          textContent: 'Test mood',
          location: { lat: 40.7128, lng: -74.006 },
          weather: {
            temperature: 22,
            condition: 'Sunny',
            humidity: 60,
            pressure: 1013,
            windSpeed: 5,
          },
        })
        .expect(400)
    })

    it('should return 400 if location is missing', async () => {
      await request(app.getHttpServer())
        .post('/moods')
        .send({
          userId,
          textContent: 'Test mood',
          rating: 5,
          weather: {
            temperature: 22,
            condition: 'Sunny',
            humidity: 60,
            pressure: 1013,
            windSpeed: 5,
          },
        })
        .expect(400)
    })

    it('should return 400 if weather is missing', async () => {
      await request(app.getHttpServer())
        .post('/moods')
        .send({
          userId,
          textContent: 'Test mood',
          rating: 5,
          location: { lat: 40.7128, lng: -74.006 },
        })
        .expect(400)
    })

    it('should submit mood with optional picture', async () => {
      const moodData = {
        userId,
        textContent: 'Beautiful sunset',
        rating: 5,
        location: { lat: 40.7128, lng: -74.006 },
        weather: {
          temperature: 20,
          condition: 'Clear',
          humidity: 55,
          pressure: 1015,
          windSpeed: 3,
        },
        picture: {
          key: 'moods/sunset.jpg',
          fileName: 'sunset.jpg',
          mimeType: 'image/jpeg',
          size: 2048576,
        },
      }

      const response = await request(app.getHttpServer()).post('/moods').send(moodData).expect(201)

      expect(response.body.mood.picture).toBeDefined()
      expect(response.body.mood.picture.fileName).toBe('sunset.jpg')
    })
  })

  describe('GET /moods', () => {
    let userId: string

    beforeEach(async () => {
      const user = await usersRepository.createUser('Test User', testUserEmail)
      userId = user._id.toString()

      // Add some test moods
      await usersRepository.addMoodToUser(userId, {
        textContent: 'First mood',
        rating: 4,
        location: { lat: 40.7128, lng: -74.006 },
        weather: {
          temperature: 22,
          condition: 'Sunny',
          humidity: 60,
          pressure: 1013,
          windSpeed: 5,
        },
      } as any)

      await usersRepository.addMoodToUser(userId, {
        textContent: 'Second mood',
        rating: 3,
        location: { lat: 40.7128, lng: -74.006 },
        weather: {
          temperature: 18,
          condition: 'Cloudy',
          humidity: 70,
          pressure: 1010,
          windSpeed: 8,
        },
      } as any)
    })

    it('should get all moods for user', async () => {
      const response = await request(app.getHttpServer()).get(`/moods?userId=${userId}`).expect(200)

      expect(response.body).toBeDefined()
      expect(response.body.moods).toBeDefined()
      expect(response.body.moods.length).toBe(2)
      expect(response.body.moods[0].textContent).toBe('First mood')
      expect(response.body.moods[1].textContent).toBe('Second mood')
    })

    it('should return empty array if user has no moods', async () => {
      const newUser = await usersRepository.createUser('New User', `new${Date.now()}@example.com`)
      const newUserId = newUser._id.toString()

      const response = await request(app.getHttpServer()).get(`/moods?userId=${newUserId}`).expect(200)

      expect(response.body.moods).toBeDefined()
      expect(response.body.moods.length).toBe(0)

      // Cleanup
      await usersRepository.deleteUser(newUserId)
    })

    it('should return 404 if user does not exist', async () => {
      const fakeId = '507f1f77bcf86cd799439011'
      await request(app.getHttpServer()).get(`/moods?userId=${fakeId}`).expect(404)
    })
  })
})
