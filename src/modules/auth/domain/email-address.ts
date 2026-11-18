import { InvalidEmailError } from './errors/invalid-email.error';

/** RFC 5321 limit on a full address. */
const MAX_LENGTH = 254;
/** Deliberately loose: the OTP itself proves the address works. */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** A normalized (trimmed, lower-cased) email address: the sign-in identity. */
export class EmailAddress {
  private constructor(readonly value: string) {}

  static parse(raw: string): EmailAddress {
    const normalized = raw.trim().toLowerCase();
    if (normalized.length > MAX_LENGTH || !EMAIL_SHAPE.test(normalized)) {
      throw new InvalidEmailError();
    }
    return new EmailAddress(normalized);
  }
}
