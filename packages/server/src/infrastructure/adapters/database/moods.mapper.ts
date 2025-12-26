import { MoodEntity } from "src/domain/entities/mood.entity";
import { Mood } from "./schemas/mood.schema";

export class MoodsMapper {
  toDomain(moodDoc: Mood): MoodEntity {
    return new MoodEntity({
      textContent: moodDoc.textContent,
      rating: moodDoc.rating,
      location: moodDoc.location,
      weather: moodDoc.weather,
      picture: moodDoc.picture,
      createdAt: moodDoc.createdAt,
      updatedAt: moodDoc.updatedAt,
    });
  }

  toPersistence(moodEntity: MoodEntity): Mood {
    return {
      textContent: moodEntity["textContent"],
      rating: moodEntity["rating"],
      location: moodEntity["location"],
      weather: moodEntity["weather"],
      picture: moodEntity["picture"],
      createdAt: moodEntity["createdAt"] || new Date(),
      updatedAt: moodEntity["updatedAt"] || new Date(),
    };
  }
}
