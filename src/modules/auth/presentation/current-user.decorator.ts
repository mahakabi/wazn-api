import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { type AccessTokenClaims } from '../domain/access-token-claims';
import { UnauthenticatedError } from '../domain/errors/unauthenticated.error';
import { type AuthenticatedRequest } from './authenticated-request';

/** The verified caller, set by AccessTokenGuard. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AccessTokenClaims => {
    const { auth } = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (auth === undefined) {
      throw new UnauthenticatedError();
    }
    return auth;
  },
);
