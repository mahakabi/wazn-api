import { type AuthUser } from '../auth-user';
import { type EmailAddress } from '../email-address';
import { type ProfileChanges } from '../profile-changes';

export interface UserRepository {
  findById(id: string): Promise<AuthUser | null>;
  findByEmail(email: EmailAddress): Promise<AuthUser | null>;
  /** Creates a MEMBER. Data minimization (PDPL): email and locale only; phone comes at booking. */
  createMember(email: EmailAddress, locale: string): Promise<AuthUser>;
  /** Throws PhoneInUseError when the phone belongs to another account; null if the user is gone. */
  updateProfile(id: string, changes: ProfileChanges): Promise<AuthUser | null>;
}

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
