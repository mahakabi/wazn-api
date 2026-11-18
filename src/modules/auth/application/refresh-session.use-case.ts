import { Inject, Injectable, Logger } from '@nestjs/common';
import { CLOCK, type Clock } from '../../../common/domain/clock';
import { InvalidRefreshTokenError } from '../domain/errors/invalid-refresh-token.error';
import {
  OPAQUE_TOKEN_GENERATOR,
  type OpaqueTokenGenerator,
} from '../domain/ports/opaque-token-generator';
import {
  REFRESH_TOKEN_REPOSITORY,
  type RefreshTokenRepository,
} from '../domain/ports/refresh-token-repository';
import { USER_REPOSITORY, type UserRepository } from '../domain/ports/user-repository';
import { type Session } from '../domain/session';
import { SessionIssuer } from './session-issuer';

/**
 * Refresh-token rotation with reuse detection: each refresh token works once. Presenting
 * an already-rotated token means it leaked (or a client bug), so the whole sign-in
 * family is revoked and the member must sign in again.
 */
@Injectable()
export class RefreshSessionUseCase {
  private readonly logger = new Logger(RefreshSessionUseCase.name);

  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokens: RefreshTokenRepository,
    @Inject(OPAQUE_TOKEN_GENERATOR) private readonly tokens: OpaqueTokenGenerator,
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(CLOCK) private readonly clock: Clock,
    private readonly sessions: SessionIssuer,
  ) {}

  async execute(refreshToken: string): Promise<Session> {
    const now = this.clock.now();
    const current = await this.refreshTokens.findByHash(this.tokens.hash(refreshToken));
    if (current === null) {
      throw new InvalidRefreshTokenError();
    }
    if (current.revokedAt !== null) {
      await this.revokeFamilyOnReuse(current.familyId, current.userId, now);
    }
    if (current.expiresAt.getTime() <= now.getTime()) {
      throw new InvalidRefreshTokenError();
    }

    const user = await this.users.findById(current.userId);
    if (user === null) {
      throw new InvalidRefreshTokenError();
    }

    const next = this.sessions.prepareRefreshToken(user.id, current.familyId);
    if (!(await this.refreshTokens.rotate(current.id, next.record, now))) {
      // Lost a race with another refresh using the same token: also a reuse.
      await this.revokeFamilyOnReuse(current.familyId, current.userId, now);
    }
    return this.sessions.toSession(user, next, false);
  }

  private async revokeFamilyOnReuse(familyId: string, userId: string, now: Date): Promise<never> {
    this.logger.warn(`Refresh token reuse detected for user ${userId}; revoking session family`);
    await this.refreshTokens.revokeFamily(familyId, now);
    throw new InvalidRefreshTokenError();
  }
}
