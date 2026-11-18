import { Inject, Injectable } from '@nestjs/common';
import { PhoneNumber } from '../../../common/domain/phone-number';
import { type AuthUser } from '../domain/auth-user';
import { UnauthenticatedError } from '../domain/errors/unauthenticated.error';
import { USER_REPOSITORY, type UserRepository } from '../domain/ports/user-repository';

export interface UpdateProfileInput {
  readonly name?: string;
  readonly locale?: 'en' | 'ar';
  readonly phone?: string;
  readonly whatsappOptIn?: boolean;
}

/** First name, language, phone (needed before booking) and WhatsApp consent. */
@Injectable()
export class UpdateProfileUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepository) {}

  async execute(userId: string, input: UpdateProfileInput): Promise<AuthUser> {
    const user = await this.users.updateProfile(userId, {
      name: input.name?.trim(),
      locale: input.locale,
      phone: input.phone === undefined ? undefined : PhoneNumber.parse(input.phone),
      whatsappOptIn: input.whatsappOptIn,
    });
    if (user === null) {
      throw new UnauthenticatedError();
    }
    return user;
  }
}
