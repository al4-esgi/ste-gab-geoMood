import { Mood } from "backup/users copy/schemas/mood.schema";
import { UserEntity } from "../../domain/users.entity";
import { RepositoryPort } from "../../shared/ports/repository.port";

export interface UserRepositoryPort extends RepositoryPort<UserEntity> {
  findUserByEmail(email: string): Promise<UserEntity>;
  addMoodToUser(userId: string, mood: Mood): Promise<UserEntity>;
}
