import { UserEntity } from "../../domain/users.entity"
import { RepositoryPort } from "../../shared/ports/repository.port"

export interface UserRepositoryPort extends RepositoryPort<UserEntity> {
	findUserByEmail(email: string) : Promise<UserEntity>
}
