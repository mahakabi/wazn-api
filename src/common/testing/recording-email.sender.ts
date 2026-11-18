import { type EmailSender, type OutgoingEmail } from '../domain/email-sender';

export class RecordingEmailSender implements EmailSender {
  readonly sent: OutgoingEmail[] = [];

  send(email: OutgoingEmail): Promise<void> {
    this.sent.push(email);
    return Promise.resolve();
  }

  /** The first run of digits in the latest email to `to` (the OTP). */
  lastCodeFor(to: string): string | undefined {
    const email = this.sent.filter((candidate) => candidate.to === to).at(-1);
    return email?.text.match(/\d{4,}/)?.[0];
  }
}
