import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/infrastructure/prisma/prisma.service';
import { Prisma, Role, type User } from '../../../generated/prisma/client';
import { type AuthUser } from '../domain/auth-user';
import { type EmailAddress } from '../domain/email-address';
import { PhoneInUseError } from '../domain/errors/phone-in-use.error';
import { type ProfileChanges } from '../domain/profile-changes';
import { type UserRepository } from '../domain/ports/user-repository';

const UNIQUE_VIOLATION = 'P2002';
const RECORD_NOT_FOUND = 'P2025';

function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    name: user.name,
    role: user.role,
    locale: user.locale,
    whatsappOptIn: user.whatsappOptIn,
  };
}

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<AuthUser | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? toAuthUser(user) : null;
  }

  async findByEmail(email: EmailAddress): Promise<AuthUser | null> {
    const user = await this.prisma.user.findUnique({ where: { email: email.value } });
    return user ? toAuthUser(user) : null;
  }

  async createMember(email: EmailAddress, locale: string): Promise<AuthUser> {
    // Upsert: two first-time sign-ins racing for the same address must not fail on the unique index.
    const user = await this.prisma.user.upsert({
      where: { email: email.value },
      create: { email: email.value, locale, role: Role.MEMBER },
      update: {},
    });
    return toAuthUser(user);
  }

  async updateProfile(id: string, changes: ProfileChanges): Promise<AuthUser | null> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          name: changes.name,
          locale: changes.locale,
          phone: changes.phone?.value,
          whatsappOptIn: changes.whatsappOptIn,
        },
      });
      return toAuthUser(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === UNIQUE_VIOLATION) throw new PhoneInUseError();
        if (error.code === RECORD_NOT_FOUND) return null;
      }
      throw error;
    }
  }
}
