import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema({ _id: false })
export class Weather {
  @Prop({ required: true })
  temperature: number

  @Prop({ required: true })
  condition: string

  @Prop({ required: true })
  humidity: number

  @Prop({ required: true })
  pressure: number

  @Prop({ required: true })
  windSpeed: number
}

export const WeatherSchema = SchemaFactory.createForClass(Weather)
