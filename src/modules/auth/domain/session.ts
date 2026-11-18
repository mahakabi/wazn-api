import { type AuthUser } from './auth-user';

export interface Session {
  readonly accessToken: string;
  readonly accessTokenExpiresIn: number;
  readonly refreshToken: string;
  readonly refreshTokenExpiresAt: Date;
  readonly user: AuthUser;
  readonly isNewUser: boolean;
}
