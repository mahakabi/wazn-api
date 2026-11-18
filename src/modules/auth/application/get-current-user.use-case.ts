import { Inject, Injectable } from '@nestjs/common';
import { type AuthUser } from '../domain/auth-user';
import { UnauthenticatedError } from '../domain/errors/unauthenticated.error';
import { USER_REPOSITORY, type UserRepository } from '../domain/ports/user-repository';

@Injectable()
export class GetCurrentUserUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepository) {}

  async execute(userId: string): Promise<AuthUser> {
    const user = await this.users.findById(userId);
    if (user === null) {
      throw new UnauthenticatedError();
    }
    return user;
  }
}
