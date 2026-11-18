import { type EmailAddress } from '../email-address';
import { type StoredOtp } from '../stored-otp';

/** Short-lived storage of the current code per email. Replacing a code resets attempts. */
export interface OtpStore {
  save(email: EmailAddress, codeHash: string, ttlSeconds: number): Promise<void>;
  find(email: EmailAddress): Promise<StoredOtp | null>;
  /** Returns the new failed-attempt count, or null if the code no longer exists. */
  recordFailedAttempt(email: EmailAddress): Promise<number | null>;
  /** Deletes the code; returns false if it was already gone (used, expired or raced). */
  consume(email: EmailAddress): Promise<boolean>;
}

export const OTP_STORE = Symbol('OTP_STORE');
