import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { validateEnv } from "../src/_utils/config/env.config";
import { UserDocument } from "../src/users/schemas/user.schema";
import { UsersModule } from "../src/users/users.module";
import { UsersRepository } from "../src/users/users.repository";
import { TestModule } from "./mocks/test.module";

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
      imports: [TestModule],
    }).compile();

    usersRepository = module.get<UsersRepository>(UsersRepository);
    testUser = await usersRepository.createUser(
      "Test User",
      `test${Date.now()}@example.com`
    );
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

  describe("Find Users", () => {
    it("should find user by ID", async () => {
      const foundUser = await usersRepository.findUserById(
        testUser._id.toString()
      );

      expect(foundUser).toBeDefined();
      expect(foundUser!._id.toString()).toBe(testUser._id.toString());
      expect(foundUser!.name).toBe(testUser.name);
      expect(foundUser!.email).toBe(testUser.email);
    });

    it("should return null for non-existent user ID", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const foundUser = await usersRepository.findUserById(fakeId);

      expect(foundUser).toBeNull();
    });

    it("should find user by email", async () => {
      const foundUser = await usersRepository.findUserByEmail(testUser.email);

      expect(foundUser).toBeDefined();
      expect(foundUser!._id.toString()).toBe(testUser._id.toString());
      expect(foundUser!.email).toBe(testUser.email);
    });

    it("should return new created user for non-existent email", async () => {
      const foundUser = await usersRepository.findUserByEmail(
        "nonexistent@example.com"
      );

      expect(foundUser).toBeDefined();
      expect(foundUser!.email).toBe("nonexistent@example.com");
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

      const updatedUser = await usersRepository.addMoodToUser(
        testUser._id.toString(),
        mood as any
      );

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

      const updatedUser = await usersRepository.addMoodToUser(
        testUser._id.toString(),
        mood as any
      );

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
      const users = await usersRepository.getMoodsByDateRange(
        startDate,
        endDate
      );

      expect(users[0].moods[0]).toBeDefined();
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

        await usersRepository.addMoodToUser(
          testUser._id.toString(),
          mood as any
        );

        const hasDuplicate = await usersRepository.checkDuplicateMoodInHour(
          testUser._id.toString()
        );

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

        const updatedUser = await usersRepository.addMoodToUser(
          testUser._id.toString(),
          mood as any
        );

        expect(updatedUser!.moods[0].weather.temperature).toBe(25);
        expect(updatedUser!.moods[0].weather.condition).toBe("Rainy");
      });
    });
  });
});
