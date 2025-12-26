import { MoodEntity } from './mood.entity'

export interface CreateUserProps {
  email: string
  moods: MoodEntity[]
  createdAt?: Date
  updatedAt?: Date
}

export class UserEntity {
  email: string
  moods: MoodEntity[]
  createdAt?: Date
  updatedAt?: Date

  constructor(createUserProps: CreateUserProps) {
    this.email = createUserProps.email
    this.moods = createUserProps.moods
    this.createdAt = createUserProps.createdAt
    this.updatedAt = createUserProps.updatedAt
  }
}
