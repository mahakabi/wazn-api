import { type AuthUser } from '../../domain/auth-user';
import { type EmailAddress } from '../../domain/email-address';
import { PhoneInUseError } from '../../domain/errors/phone-in-use.error';
import { type ProfileChanges } from '../../domain/profile-changes';
import { type UserRepository } from '../../domain/ports/user-repository';

export class InMemoryUserRepository implements UserRepository {
  readonly users: AuthUser[] = [];

  findById(id: string): Promise<AuthUser | null> {
    return Promise.resolve(this.users.find((user) => user.id === id) ?? null);
  }

  findByEmail(email: EmailAddress): Promise<AuthUser | null> {
    return Promise.resolve(this.users.find((user) => user.email === email.value) ?? null);
  }

  createMember(email: EmailAddress, locale: string): Promise<AuthUser> {
    const user: AuthUser = {
      id: `user_${this.users.length + 1}`,
      email: email.value,
      phone: null,
      name: null,
      role: 'MEMBER',
      locale,
      whatsappOptIn: false,
    };
    this.users.push(user);
    return Promise.resolve(user);
  }

  updateProfile(id: string, changes: ProfileChanges): Promise<AuthUser | null> {
    const index = this.users.findIndex((user) => user.id === id);
    const current = this.users[index];
    if (current === undefined) return Promise.resolve(null);
    const phone = changes.phone?.value;
    if (phone !== undefined && this.users.some((user) => user.id !== id && user.phone === phone)) {
      return Promise.reject(new PhoneInUseError());
    }
    const updated: AuthUser = {
      ...current,
      name: changes.name ?? current.name,
      locale: changes.locale ?? current.locale,
      phone: phone ?? current.phone,
      whatsappOptIn: changes.whatsappOptIn ?? current.whatsappOptIn,
    };
    this.users[index] = updated;
    return Promise.resolve(updated);
  }
}
