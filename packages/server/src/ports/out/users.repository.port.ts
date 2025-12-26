import { UserEntity } from "../../domain/entities/users.entity";
import { RepositoryPort } from "../../shared/ports/repository.port";

export interface UserRepositoryPort extends RepositoryPort<UserEntity> {
  findUserByEmail(email: string): Promise<UserEntity>;
  save(user: UserEntity): Promise<void>;
}
