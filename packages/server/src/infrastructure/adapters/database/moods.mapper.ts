import { MoodVO } from "src/domain/value-objects/mood.vo";
import { Mood } from "./schemas/mood.schema";

export class MoodsMapper {
  toDomain(moodDoc: Mood): MoodVO {
    return new MoodVO({
      textContent: moodDoc.textContent,
      rating: moodDoc.rating,
      location: moodDoc.location,
      weather: moodDoc.weather,
      picture: moodDoc.picture,
      createdAt: moodDoc.createdAt,
      updatedAt: moodDoc.updatedAt,
    });
  }

  toPersistence(moodVO: MoodVO): Mood {
    return {
      textContent: moodVO["textContent"],
      rating: moodVO["rating"],
      location: moodVO["location"],
      weather: moodVO["weather"],
      picture: moodVO["picture"],
      createdAt: moodVO["createdAt"] || new Date(),
      updatedAt: moodVO["updatedAt"] || new Date(),
    };
  }
}
