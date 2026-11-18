import { Inject, Injectable } from '@nestjs/common';
import { EMAIL_SENDER, type EmailSender } from '../../../common/domain/email-sender';
import { EmailAddress } from '../domain/email-address';
import { OtpRateLimitedError } from '../domain/errors/otp-rate-limited.error';
import { OTP_POLICY } from '../domain/otp-policy';
import { OTP_CODEC, type OtpCodec } from '../domain/ports/otp-codec';
import { OTP_REQUEST_LIMITER, type OtpRequestLimiter } from '../domain/ports/otp-request-limiter';
import { OTP_STORE, type OtpStore } from '../domain/ports/otp-store';
import { type MessageLocale, otpEmail } from './otp-email';

export interface RequestOtpInput {
  readonly email: string;
  readonly locale: MessageLocale;
}

export interface RequestOtpResult {
  readonly expiresInSeconds: number;
  readonly resendAfterSeconds: number;
}

@Injectable()
export class RequestOtpUseCase {
  constructor(
    @Inject(OTP_REQUEST_LIMITER) private readonly limiter: OtpRequestLimiter,
    @Inject(OTP_CODEC) private readonly codec: OtpCodec,
    @Inject(OTP_STORE) private readonly store: OtpStore,
    @Inject(EMAIL_SENDER) private readonly mailer: EmailSender,
  ) {}

  async execute(input: RequestOtpInput): Promise<RequestOtpResult> {
    const email = EmailAddress.parse(input.email);

    // Limit per address before sending anything: stops inbox spamming and protects sender reputation.
    const decision = await this.limiter.tryAcquire(email, {
      cooldownSeconds: OTP_POLICY.resendCooldownSeconds,
      maxPerHour: OTP_POLICY.maxRequestsPerHour,
    });
    if (!decision.allowed) {
      throw new OtpRateLimitedError(decision.reason, decision.retryAfterSeconds);
    }

    const code = this.codec.generate(OTP_POLICY.codeLength);
    await this.store.save(email, this.codec.hash(email, code), OTP_POLICY.ttlSeconds);
    await this.mailer.send(otpEmail(email, code, input.locale));

    return {
      expiresInSeconds: OTP_POLICY.ttlSeconds,
      resendAfterSeconds: OTP_POLICY.resendCooldownSeconds,
    };
  }
}
