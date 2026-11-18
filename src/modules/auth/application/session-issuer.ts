import { Inject, Injectable } from '@nestjs/common';
import { CLOCK, type Clock } from '../../../common/domain/clock';
import { type AuthUser } from '../domain/auth-user';
import {
  ACCESS_TOKEN_SERVICE,
  type AccessTokenService,
} from '../domain/ports/access-token-service';
import {
  OPAQUE_TOKEN_GENERATOR,
  type OpaqueTokenGenerator,
} from '../domain/ports/opaque-token-generator';
import { type NewRefreshToken } from '../domain/refresh-token-record';
import { type Session } from '../domain/session';
import { SESSION_POLICY } from '../domain/session-policy';

const MS_PER_SECOND = 1000;

export interface PreparedRefreshToken {
  readonly token: string;
  readonly record: NewRefreshToken;
}

/** Builds access + refresh tokens. Persistence is left to the calling use case. */
@Injectable()
export class SessionIssuer {
  constructor(
    @Inject(ACCESS_TOKEN_SERVICE) private readonly accessTokens: AccessTokenService,
    @Inject(OPAQUE_TOKEN_GENERATOR) private readonly tokens: OpaqueTokenGenerator,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  newFamilyId(): string {
    return this.tokens.generate();
  }

  prepareRefreshToken(userId: string, familyId: string): PreparedRefreshToken {
    const token = this.tokens.generate();
    const expiresAt = new Date(
      this.clock.now().getTime() + SESSION_POLICY.refreshTokenTtlSeconds * MS_PER_SECOND,
    );
    return { token, record: { userId, familyId, tokenHash: this.tokens.hash(token), expiresAt } };
  }

  async toSession(
    user: AuthUser,
    refresh: PreparedRefreshToken,
    isNewUser: boolean,
  ): Promise<Session> {
    const accessToken = await this.accessTokens.sign(
      { userId: user.id, role: user.role },
      SESSION_POLICY.accessTokenTtlSeconds,
    );
    return {
      accessToken,
      accessTokenExpiresIn: SESSION_POLICY.accessTokenTtlSeconds,
      refreshToken: refresh.token,
      refreshTokenExpiresAt: refresh.record.expiresAt,
      user,
      isNewUser,
    };
  }
}
