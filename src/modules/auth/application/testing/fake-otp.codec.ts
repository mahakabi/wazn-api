import { type EmailAddress } from '../../domain/email-address';
import { type OtpCodec } from '../../domain/ports/otp-codec';

export class FakeOtpCodec implements OtpCodec {
  constructor(private readonly nextCode = '123456') {}

  generate(): string {
    return this.nextCode;
  }

  hash(email: EmailAddress, code: string): string {
    return `hash(${email.value}:${code})`;
  }

  matches(email: EmailAddress, code: string, codeHash: string): boolean {
    return this.hash(email, code) === codeHash;
  }
}
