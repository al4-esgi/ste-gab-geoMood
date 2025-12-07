import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { validateEnv } from "../src/_utils/config/env.config";
import { UsersModule } from "../src/users/users.module";
import { UsersRepository } from "../src/users/users.repository";
import { UserDocument } from "../src/users/schemas/user.schema";

/*
### Database Storage

- Create User schema with moods array
- Save mood entries to user's moods collection
- Retrieve mood entries by date range
- Prevent duplicate mood entries within same hour
- Support CRUD operations on moods

*/

describe("Mood Database Storage", () => {
  let module: TestingModule;
  let usersRepository: UsersRepository;
  let testUser: UserDocument;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: [".env"],
          validate: validateEnv,
        }),
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            uri: configService.get("DATABASE.DATABASE_URL"),
            dbName: `${configService.get("DATABASE.DATABASE_NAME")}_test`,
          }),
        }),
        UsersModule,
      ],
    }).compile();

    usersRepository = module.get<UsersRepository>(UsersRepository);
    testUser = await usersRepository.createUser("Test User", `test${Date.now()}@example.com`);
  });

  afterEach(async () => {
    if (testUser) {
      await usersRepository.deleteUser(testUser._id.toString());
    }
  });

  describe("User Schema", () => {
    it("should create user with empty moods array", async () => {
      expect(testUser).toBeDefined();
      expect(testUser.moods).toBeDefined();
      expect(testUser.moods).toHaveLength(0);
    });

    it("should have user fields (name, email)", async () => {
      expect(testUser.name).toBe("Test User");
      expect(testUser.email).toContain("test");
      expect(testUser.email).toContain("@example.com");
    });
  });

  describe("Save Mood to User", () => {
    it("should save mood to user's array", async () => {
      const mood = {
        textContent: "I feel happy!",
        rating: 5,
        location: { lat: 40.7128, lng: -74.006 },
        weather: {
          temperature: 22,
          condition: "Sunny",
          humidity: 60,
          pressure: 1013,
          windSpeed: 5,
        },
      };

      const updatedUser = await usersRepository.addMoodToUser(testUser._id.toString(), mood as any);

      expect(updatedUser).toBeDefined();
      expect(updatedUser!.moods).toHaveLength(1);
      expect(updatedUser!.moods[0].textContent).toBe("I feel happy!");
      expect(updatedUser!.moods[0].rating).toBe(5);
    });

    it("should save mood with picture", async () => {
      const mood = {
        textContent: "Beautiful sunset",
        rating: 5,
        location: { lat: 40.7128, lng: -74.006 },
        weather: {
          temperature: 20,
          condition: "Clear",
          humidity: 55,
          pressure: 1015,
          windSpeed: 3,
        },
        picture: {
          key: "moods/sunset.jpg",
          fileName: "sunset.jpg",
          mimeType: "image/jpeg",
          size: 2048576,
          createdAt: new Date(),
        },
      };

      const updatedUser = await usersRepository.addMoodToUser(testUser._id.toString(), mood as any);

      expect(updatedUser).toBeDefined();
      expect(updatedUser!.moods[0].picture).toBeDefined();
      expect(updatedUser!.moods[0].picture!.fileName).toBe("sunset.jpg");
    });
  });

  describe("Retrieve Moods", () => {
    it("should get all user moods", async () => {
      const mood = {
        textContent: "Test mood",
        rating: 3,
        location: { lat: 0, lng: 0 },
        weather: {
          temperature: 20,
          condition: "Clear",
          humidity: 60,
          pressure: 1013,
          windSpeed: 5,
        },
      };

      await usersRepository.addMoodToUser(testUser._id.toString(), mood as any);
      const moods = await usersRepository.getUserMoods(testUser._id.toString());

      expect(moods).toBeDefined();
      expect(moods.length).toBeGreaterThan(0);
    });

    it("should get moods by date range", async () => {
      const mood = {
        textContent: "Test mood",
        rating: 3,
        location: { lat: 0, lng: 0 },
        weather: {
          temperature: 20,
          condition: "Clear",
          humidity: 60,
          pressure: 1013,
          windSpeed: 5,
        },
      };

      await usersRepository.addMoodToUser(testUser._id.toString(), mood as any);

      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const endDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const moods = await usersRepository.getMoodsByDateRange(
        testUser._id.toString(),
        startDate,
        endDate
      );

      expect(moods).toBeDefined();
    });

    it("should get mood by ID", async () => {
      const mood = {
        textContent: "Test mood",
        rating: 3,
        location: { lat: 0, lng: 0 },
        weather: {
          temperature: 20,
          condition: "Clear",
          humidity: 60,
          pressure: 1013,
          windSpeed: 5,
        },
      };

      const updatedUser = await usersRepository.addMoodToUser(testUser._id.toString(), mood as any);
      const moodId = (updatedUser!.moods[0] as any)._id.toString();

      const foundMood = await usersRepository.getMoodById(testUser._id.toString(), moodId);

      expect(foundMood).toBeDefined();
      expect(foundMood!.textContent).toBe("Test mood");
    });
  });

  describe("Update Mood", () => {
    it("should update text content", async () => {
      const mood = {
        textContent: "Original text",
        rating: 3,
        location: { lat: 0, lng: 0 },
        weather: {
          temperature: 20,
          condition: "Clear",
          humidity: 60,
          pressure: 1013,
          windSpeed: 5,
        },
      };

      const updatedUser = await usersRepository.addMoodToUser(testUser._id.toString(), mood as any);
      const moodId = (updatedUser!.moods[0] as any)._id.toString();

      const result = await usersRepository.updateMood(
        testUser._id.toString(),
        moodId,
        { textContent: "Updated text" }
      );

      expect(result).toBeDefined();
    });

    it("should update rating", async () => {
      const mood = {
        textContent: "Test",
        rating: 3,
        location: { lat: 0, lng: 0 },
        weather: {
          temperature: 20,
          condition: "Clear",
          humidity: 60,
          pressure: 1013,
          windSpeed: 5,
        },
      };

      const updatedUser = await usersRepository.addMoodToUser(testUser._id.toString(), mood as any);
      const moodId = (updatedUser!.moods[0] as any)._id.toString();

      const result = await usersRepository.updateMood(
        testUser._id.toString(),
        moodId,
        { rating: 5 }
      );

      expect(result).toBeDefined();
    });
  });

  describe("Delete Mood", () => {
    it("should delete mood from array", async () => {
      const mood = {
        textContent: "To be deleted",
        rating: 3,
        location: { lat: 0, lng: 0 },
        weather: {
          temperature: 20,
          condition: "Clear",
          humidity: 60,
          pressure: 1013,
          windSpeed: 5,
        },
      };

      const updatedUser = await usersRepository.addMoodToUser(testUser._id.toString(), mood as any);
      const moodId = (updatedUser!.moods[0] as any)._id.toString();

      const result = await usersRepository.deleteMood(testUser._id.toString(), moodId);

      expect(result).toBeDefined();
      expect(result!.moods).toHaveLength(0);
    });
  });

  describe("Business Rules", () => {
    it("should prevent duplicate moods within same hour", async () => {
      const mood = {
        textContent: "First mood",
        rating: 3,
        location: { lat: 0, lng: 0 },
        weather: {
          temperature: 20,
          condition: "Clear",
          humidity: 60,
          pressure: 1013,
          windSpeed: 5,
        },
      };

      await usersRepository.addMoodToUser(testUser._id.toString(), mood as any);

      const hasDuplicate = await usersRepository.checkDuplicateMoodInHour(testUser._id.toString());

      expect(hasDuplicate).toBe(true);
    });

    it("should snapshot weather at creation", async () => {
      const mood = {
        textContent: "Weather test",
        rating: 4,
        location: { lat: 0, lng: 0 },
        weather: {
          temperature: 25,
          condition: "Rainy",
          humidity: 80,
          pressure: 1010,
          windSpeed: 10,
        },
      };

      const updatedUser = await usersRepository.addMoodToUser(testUser._id.toString(), mood as any);

      expect(updatedUser!.moods[0].weather.temperature).toBe(25);
      expect(updatedUser!.moods[0].weather.condition).toBe("Rainy");
    });
  });
});
