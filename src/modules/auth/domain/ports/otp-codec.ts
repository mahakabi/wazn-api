import { type EmailAddress } from '../email-address';

/** Generates codes and hashes them so a Redis dump never reveals a usable code. */
export interface OtpCodec {
  generate(length: number): string;
  hash(email: EmailAddress, code: string): string;
  matches(email: EmailAddress, code: string, codeHash: string): boolean;
}

export const OTP_CODEC = Symbol('OTP_CODEC');
