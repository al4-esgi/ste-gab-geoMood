export interface CreateMoodProps {
  textContent: string
  rating: number
  location: Location
  weather: any
  picture?: string
  createdAt?: Date
  updatedAt?: Date
}

export class MoodEntity {
  private textContent: string
  private rating: number
  private location: Location
  private weather: any // Weather
  private picture?: string
  private createdAt?: Date
  private updatedAt?: Date

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
