import { type AccessTokenClaims } from '../../domain/access-token-claims';
import { type AccessTokenService } from '../../domain/ports/access-token-service';

export class FakeAccessTokenService implements AccessTokenService {
  sign(claims: AccessTokenClaims): Promise<string> {
    return Promise.resolve(`access:${claims.userId}:${claims.role}`);
  }

  verify(token: string): Promise<AccessTokenClaims | null> {
    const [prefix, userId, role] = token.split(':');
    if (
      prefix !== 'access' ||
      !userId ||
      (role !== 'MEMBER' && role !== 'GYM_STAFF' && role !== 'ADMIN')
    ) {
      return Promise.resolve(null);
    }
    return Promise.resolve({ userId, role });
  }
}
