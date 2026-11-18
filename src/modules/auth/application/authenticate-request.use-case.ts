import { Inject, Injectable } from '@nestjs/common';
import { type AccessTokenClaims } from '../domain/access-token-claims';
import { UnauthenticatedError } from '../domain/errors/unauthenticated.error';
import {
  ACCESS_TOKEN_SERVICE,
  type AccessTokenService,
} from '../domain/ports/access-token-service';

const BEARER_PREFIX = 'Bearer ';

@Injectable()
export class AuthenticateRequestUseCase {
  constructor(@Inject(ACCESS_TOKEN_SERVICE) private readonly accessTokens: AccessTokenService) {}

  async execute(authorizationHeader: string | undefined): Promise<AccessTokenClaims> {
    if (!authorizationHeader?.startsWith(BEARER_PREFIX)) {
      throw new UnauthenticatedError();
    }
    const claims = await this.accessTokens.verify(authorizationHeader.slice(BEARER_PREFIX.length));
    if (claims === null) {
      throw new UnauthenticatedError();
    }
    return claims;
  }
}
