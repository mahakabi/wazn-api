export interface OutgoingEmail {
  readonly to: string;
  readonly subject: string;
  readonly text: string;
  readonly html: string;
}

export interface EmailSender {
  send(email: OutgoingEmail): Promise<void>;
}

export const EMAIL_SENDER = Symbol('EMAIL_SENDER');
