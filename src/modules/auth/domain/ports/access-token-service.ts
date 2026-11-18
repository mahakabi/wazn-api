import { type AccessTokenClaims } from '../access-token-claims';

export interface AccessTokenService {
  sign(claims: AccessTokenClaims, ttlSeconds: number): Promise<string>;
  /** Returns null for any invalid, expired or tampered token. */
  verify(token: string): Promise<AccessTokenClaims | null>;
}

export const ACCESS_TOKEN_SERVICE = Symbol('ACCESS_TOKEN_SERVICE');
