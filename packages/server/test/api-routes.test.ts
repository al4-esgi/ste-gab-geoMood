import { INestApplication, ValidationPipe } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { MemoryStoredFile, NestjsFormDataModule } from "nestjs-form-data";
import { validateEnv } from "../src/_utils/config/env.config";
import { UsersModule } from "../src/users/users.module";
import { UsersRepository } from "../src/users/users.repository";
import { MoodsModule } from "../src/moods/moods.module";
import { MoodsService } from "../src/moods/moods.service";
import { TestModule } from "./mocks/test.module";
import * as fs from "fs";
import * as path from "path";

/*
### API Routes Tests

- POST /moods - Submit mood entry with text, rating, location, weather
- GET /moods - Get user's moods
*/

describe("API Routes", { timeout: 30000 }, () => {
  let app: INestApplication;
  let module: TestingModule;
  let usersRepository: UsersRepository;
  let moodsService: MoodsService;
  let testUserEmail: string;

  const mockLocation = { lat: 40.7128, lng: -74.006 };
  const mockWeather = {
    temperature: 22,
    condition: "Sunny",
    humidity: 60,
    pressure: 1013,
    windSpeed: 5,
  };

  beforeEach(async () => {
    testUserEmail = `test${Date.now()}@example.com`;

    module = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    app = module.createNestApplication();
    app.setGlobalPrefix("api/v1");
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      })
    );
    await app.init();

    usersRepository = module.get<UsersRepository>(UsersRepository);
    moodsService = module.get<MoodsService>(MoodsService);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    const user = await usersRepository.findUserByEmail(testUserEmail);
    if (user) {
      await usersRepository.deleteUser(user._id.toString());
    }
    await app.close();
  });

  describe("POST /moods", () => {
    beforeEach(async () => {
      await usersRepository.createUser("Test User", testUserEmail);
    });

    it("should submit mood with all required fields", async () => {
      const moodData = {
        email: testUserEmail,
        textContent: "Feeling great today!",
        rating: 5,
        location: mockLocation,
      };

      const response = await request(app.getHttpServer())
        .post("/api/v1/moods")
        .send(moodData)
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.textContent).toBe("Feeling great today!");
      expect(response.body.rating).toBeDefined();
    });

    it("should submit mood with picture and analyze sentiment from image", async () => {
      const happyImagePath = path.join(
        __dirname,
        "mocks",
        "portraits",
        "happy.jpg"
      );
      const imageBuffer = fs.readFileSync(happyImagePath);

      const response = await request(app.getHttpServer())
        .post("/api/v1/moods")
        .field("email", testUserEmail)
        .field("textContent", "Beautiful sunset!")
        .field("rating", 3)
        .field("location", JSON.stringify(mockLocation))
        .attach("picture", imageBuffer, {
          filename: "happy.jpg",
          contentType: "image/jpeg",
        });

      if (response.status !== 201) {
        console.log("Response status:", response.status);
        console.log("Response body:", JSON.stringify(response.body, null, 2));
      }

      expect(response.status).toBe(201);

      expect(response.body).toBeDefined();
      expect(response.body.picture).toBeDefined();
    });

    it("should return 400 if email is missing", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/moods")
        .send({
          textContent: "Test mood",
          rating: 5,
          location: mockLocation,
          weather: mockWeather,
        })
        .expect(400);
    });

    it("should return 400 if textContent is missing", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/moods")
        .send({
          email: testUserEmail,
          rating: 5,
          location: mockLocation,
        })
        .expect(400);
    });

    it("should return 400 if rating is missing", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/moods")
        .send({
          email: testUserEmail,
          textContent: "Test mood",
          location: mockLocation,
        })
        .expect(400);
    });

    it("should return 400 if location is missing", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/moods")
        .send({
          email: testUserEmail,
          textContent: "Test mood",
          rating: 5,
        })
        .expect(400);
    });
  });

  describe("GET /moods", () => {
    let userId: string;

    beforeEach(async () => {
      const user = await usersRepository.createUser("Test User", testUserEmail);
      userId = user._id.toString();

      await usersRepository.addMoodToUser(userId, {
        textContent: "First mood",
        rating: 4,
        location: { lat: 40.7128, lng: -74.006 },
        weather: {
          temperature: 22,
          condition: "Sunny",
          humidity: 60,
          pressure: 1013,
          windSpeed: 5,
        },
      } as any);

      await usersRepository.addMoodToUser(userId, {
        textContent: "Second mood",
        rating: 3,
        location: { lat: 40.7128, lng: -74.006 },
        weather: {
          temperature: 18,
          condition: "Cloudy",
          humidity: 70,
          pressure: 1010,
          windSpeed: 8,
        },
      } as any);
    });

    it("should get all moods from today", async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/moods`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.moods).toBeDefined();
      expect(response.body.moods.length).toBeGreaterThanOrEqual(2);

      const userMoods = response.body.moods.filter(
        (m: any) =>
          m.textContent === "First mood" || m.textContent === "Second mood"
      );
      expect(userMoods.length).toBe(2);
    });
  });
});
