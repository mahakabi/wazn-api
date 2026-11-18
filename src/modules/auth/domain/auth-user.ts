import { type UserRole } from './user-role';

export interface AuthUser {
  readonly id: string;
  readonly email: string | null;
  /** Added at first booking; null until then. */
  readonly phone: string | null;
  readonly name: string | null;
  readonly role: UserRole;
  readonly locale: string;
  readonly whatsappOptIn: boolean;
}
