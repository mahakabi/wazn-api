import { type UserRole } from './user-role';

/** What the API trusts about the caller after verifying an access token. */
export interface AccessTokenClaims {
  readonly userId: string;
  readonly role: UserRole;
}
