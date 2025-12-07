import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { Mood, MoodSchema } from './mood.schema'

export type UserDocument = User & Document

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string

  @Prop({ required: true, unique: true })
  email: string

  @Prop({ type: [MoodSchema], default: [] })
  moods: Mood[]

  @Prop()
  createdAt?: Date

  @Prop()
  updatedAt?: Date
}

export const UserSchema = SchemaFactory.createForClass(User)

UserSchema.index({ email: 1 })
UserSchema.index({ 'moods.createdAt': -1 })
