import { Injectable } from '@nestjs/common';
import { createTransport, type Transporter } from 'nodemailer';
import { AppConfigService } from '../../../config/app-config.service';
import { type EmailSender, type OutgoingEmail } from '../../domain/email-sender';

/**
 * Sends through any SMTP server. Locally that's Mailpit (docker compose, UI on :8025);
 * in production, any provider's SMTP credentials via env.
 */
@Injectable()
export class SmtpEmailSender implements EmailSender {
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(config: AppConfigService) {
    const user = config.get('SMTP_USER');
    this.transporter = createTransport({
      host: config.get('SMTP_HOST'),
      port: config.get('SMTP_PORT'),
      secure: config.get('SMTP_SECURE'),
      auth: user ? { user, pass: config.get('SMTP_PASS') } : undefined,
    });
    this.from = config.get('MAIL_FROM');
  }

  async send(email: OutgoingEmail): Promise<void> {
    await this.transporter.sendMail({ from: this.from, ...email });
  }
}
