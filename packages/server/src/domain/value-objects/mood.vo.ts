import { Location } from './location.vo'

export interface CreateMoodProps {
  textContent: string
  rating: number
  location: Location
  weather: any
  picture?: string
  createdAt?: Date
  updatedAt?: Date
}

export class MoodVO {
  public readonly textContent: string
  public readonly rating: number
  public readonly location: Location
  public readonly weather: any // Weather
  public readonly picture?: string
  public readonly createdAt?: Date
  public readonly updatedAt?: Date

  constructor(createMoodProps: CreateMoodProps) {
    this.textContent = createMoodProps.textContent
    this.rating = createMoodProps.rating
    this.location = createMoodProps.location
    this.weather = createMoodProps.weather
    this.picture = createMoodProps.picture
    this.createdAt = createMoodProps.createdAt
    this.updatedAt = createMoodProps.updatedAt
  }
}
