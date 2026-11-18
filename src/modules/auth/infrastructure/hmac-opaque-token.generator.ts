import { createHmac, randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../../config/app-config.service';
import { type OpaqueTokenGenerator } from '../domain/ports/opaque-token-generator';

const TOKEN_BYTES = 32;

/**
 * 256-bit random tokens. Stored as HMAC-SHA256 keyed with JWT_REFRESH_SECRET, so a
 * database leak alone can't be used to look up or forge tokens. A slow hash (bcrypt)
 * isn't needed: the input is random, not a guessable password.
 */
@Injectable()
export class HmacOpaqueTokenGenerator implements OpaqueTokenGenerator {
  private readonly secret: string;

  constructor(config: AppConfigService) {
    this.secret = config.get('JWT_REFRESH_SECRET');
  }

  generate(): string {
    return randomBytes(TOKEN_BYTES).toString('base64url');
  }

  hash(token: string): string {
    return createHmac('sha256', this.secret).update(token).digest('hex');
  }
}
