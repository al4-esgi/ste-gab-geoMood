import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { MinioFile } from "../../minio/minio-file.schema";
import { Location, LocationSchema } from "./location.schema";
import { Weather, WeatherSchema } from "./weather.schema";

@Schema({ timestamps: true, _id: true })
export class Mood {
  @Prop({ required: true, maxlength: 1000, trim: true })
  textContent: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ type: LocationSchema, required: true })
  location: Location;

  @Prop({ type: WeatherSchema, required: true })
  weather: Weather;

  @Prop({ type: Object, required: false })
  picture?: MinioFile;

  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const MoodSchema = SchemaFactory.createForClass(Mood);
