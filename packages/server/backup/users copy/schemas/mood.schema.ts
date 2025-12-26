import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Location, LocationSchema } from "./location.schema";
import { Weather, WeatherSchema } from "./weather.schema";

export type MoodDocument = Mood & Document;

@Schema({ timestamps: true, _id: false })
export class Mood {
  @Prop({ required: true, maxlength: 1000, trim: true })
  textContent: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ type: LocationSchema, required: true })
  location: Location;

  @Prop({ type: WeatherSchema, required: true })
  weather: Weather;

  @Prop({ type: String })
  picture?: string;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const MoodSchema = SchemaFactory.createForClass(Mood);
