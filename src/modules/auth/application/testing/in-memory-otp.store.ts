import { type EmailAddress } from '../../domain/email-address';
import { type OtpStore } from '../../domain/ports/otp-store';
import { type StoredOtp } from '../../domain/stored-otp';

export class InMemoryOtpStore implements OtpStore {
  readonly entries = new Map<string, StoredOtp>();

  save(email: EmailAddress, codeHash: string): Promise<void> {
    this.entries.set(email.value, { codeHash, failedAttempts: 0 });
    return Promise.resolve();
  }

  find(email: EmailAddress): Promise<StoredOtp | null> {
    return Promise.resolve(this.entries.get(email.value) ?? null);
  }

  recordFailedAttempt(email: EmailAddress): Promise<number | null> {
    const entry = this.entries.get(email.value);
    if (!entry) return Promise.resolve(null);
    const failedAttempts = entry.failedAttempts + 1;
    this.entries.set(email.value, { ...entry, failedAttempts });
    return Promise.resolve(failedAttempts);
  }

  consume(email: EmailAddress): Promise<boolean> {
    return Promise.resolve(this.entries.delete(email.value));
  }
}
