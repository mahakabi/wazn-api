import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { AppConfigService } from '../../../config/app-config.service';
import { type EmailAddress } from '../domain/email-address';
import { type OtpCodec } from '../domain/ports/otp-codec';

const DECIMAL_BASE = 10;

@Injectable()
export class HmacOtpCodec implements OtpCodec {
  private readonly secret: string;

  constructor(config: AppConfigService) {
    this.secret = config.get('OTP_SECRET');
  }

  generate(length: number): string {
    // randomInt is a CSPRNG; padStart keeps leading zeros (e.g. "004217").
    return String(randomInt(0, DECIMAL_BASE ** length)).padStart(length, '0');
  }

  hash(email: EmailAddress, code: string): string {
    // Binding the email means a hash can't be replayed against another address.
    return createHmac('sha256', this.secret).update(`${email.value}:${code}`).digest('hex');
  }

  matches(email: EmailAddress, code: string, codeHash: string): boolean {
    const expected = Buffer.from(codeHash, 'hex');
    const actual = Buffer.from(this.hash(email, code), 'hex');
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  }
}
