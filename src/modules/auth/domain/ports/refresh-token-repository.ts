import { type NewRefreshToken, type RefreshTokenRecord } from '../refresh-token-record';

export interface RefreshTokenRepository {
  create(token: NewRefreshToken): Promise<void>;
  findByHash(tokenHash: string): Promise<RefreshTokenRecord | null>;
  /**
   * Atomically revokes `currentId` and stores `next`. Returns false (and stores nothing)
   * if `currentId` was already revoked — i.e. a concurrent refresh used it first.
   */
  rotate(currentId: string, next: NewRefreshToken, at: Date): Promise<boolean>;
  revokeFamily(familyId: string, at: Date): Promise<void>;
}

export const REFRESH_TOKEN_REPOSITORY = Symbol('REFRESH_TOKEN_REPOSITORY');
