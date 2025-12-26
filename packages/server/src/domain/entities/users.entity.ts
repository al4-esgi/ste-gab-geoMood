import { MoodEntity } from "./mood.entity";

export interface CreateUserProps {
  id: string;
  email: string;
  moods: MoodEntity[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class UserEntity {
  public readonly id: string;
  public readonly email: string;
  public readonly moods: MoodEntity[];
  public readonly createdAt?: Date;
  public readonly updatedAt?: Date;

  constructor(createUserProps: CreateUserProps) {
    this.id = createUserProps.id;
    this.email = createUserProps.email;
    this.moods = createUserProps.moods;
    this.createdAt = createUserProps.createdAt;
    this.updatedAt = createUserProps.updatedAt;
  }

  async checkDuplicateMoodInHour(): Promise<boolean> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    return this.moods.some(
      (mood: any) => mood.createdAt && mood.createdAt > oneHourAgo
    );
  }

  addMood(mood: MoodEntity): void {
    this.moods.push(mood);
  }
}
