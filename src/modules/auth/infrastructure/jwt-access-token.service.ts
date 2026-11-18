import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { type AccessTokenClaims } from '../domain/access-token-claims';
import { type AccessTokenService } from '../domain/ports/access-token-service';
import { USER_ROLES, type UserRole } from '../domain/user-role';

interface AccessTokenPayload {
  sub: string;
  role: UserRole;
}

function isUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && (USER_ROLES as readonly string[]).includes(value);
}

/** HS256 JWTs. JwtModule is registered with the secret, algorithm and issuer. */
@Injectable()
export class JwtAccessTokenService implements AccessTokenService {
  constructor(private readonly jwt: JwtService) {}

  sign(claims: AccessTokenClaims, ttlSeconds: number): Promise<string> {
    const payload: AccessTokenPayload = { sub: claims.userId, role: claims.role };
    return this.jwt.signAsync(payload, { expiresIn: ttlSeconds });
  }

  async verify(token: string): Promise<AccessTokenClaims | null> {
    try {
      const payload = await this.jwt.verifyAsync<Partial<AccessTokenPayload>>(token);
      if (typeof payload.sub !== 'string' || !isUserRole(payload.role)) {
        return null;
      }
      return { userId: payload.sub, role: payload.role };
    } catch {
      return null;
    }
  }
}
