import { Inject, Injectable } from '@nestjs/common';
import { CLOCK, type Clock } from '../../../common/domain/clock';
import {
  OPAQUE_TOKEN_GENERATOR,
  type OpaqueTokenGenerator,
} from '../domain/ports/opaque-token-generator';
import {
  REFRESH_TOKEN_REPOSITORY,
  type RefreshTokenRepository,
} from '../domain/ports/refresh-token-repository';

/** Revokes the sign-in the refresh token belongs to. Idempotent: unknown tokens are ignored. */
@Injectable()
export class SignOutUseCase {
  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokens: RefreshTokenRepository,
    @Inject(OPAQUE_TOKEN_GENERATOR) private readonly tokens: OpaqueTokenGenerator,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async execute(refreshToken: string): Promise<void> {
    const current = await this.refreshTokens.findByHash(this.tokens.hash(refreshToken));
    if (current !== null) {
      await this.refreshTokens.revokeFamily(current.familyId, this.clock.now());
    }
  }
}
