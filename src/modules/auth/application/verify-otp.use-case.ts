import { Inject, Injectable } from '@nestjs/common';
import { EmailAddress } from '../domain/email-address';
import { InvalidOtpError } from '../domain/errors/invalid-otp.error';
import { OtpAttemptsExceededError } from '../domain/errors/otp-attempts-exceeded.error';
import { OtpExpiredError } from '../domain/errors/otp-expired.error';
import { OTP_POLICY } from '../domain/otp-policy';
import { OTP_CODEC, type OtpCodec } from '../domain/ports/otp-codec';
import { OTP_STORE, type OtpStore } from '../domain/ports/otp-store';
import {
  REFRESH_TOKEN_REPOSITORY,
  type RefreshTokenRepository,
} from '../domain/ports/refresh-token-repository';
import { USER_REPOSITORY, type UserRepository } from '../domain/ports/user-repository';
import { type Session } from '../domain/session';
import { type MessageLocale } from './otp-email';
import { SessionIssuer } from './session-issuer';

export interface VerifyOtpInput {
  readonly email: string;
  readonly code: string;
  readonly locale: MessageLocale;
}

@Injectable()
export class VerifyOtpUseCase {
  constructor(
    @Inject(OTP_STORE) private readonly store: OtpStore,
    @Inject(OTP_CODEC) private readonly codec: OtpCodec,
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokens: RefreshTokenRepository,
    private readonly sessions: SessionIssuer,
  ) {}

  async execute(input: VerifyOtpInput): Promise<Session> {
    const email = EmailAddress.parse(input.email);
    await this.checkCode(email, input.code);

    // Single use: if a concurrent request consumed it first, this one loses.
    if (!(await this.store.consume(email))) {
      throw new OtpExpiredError();
    }

    const existing = await this.users.findByEmail(email);
    const user = existing ?? (await this.users.createMember(email, input.locale));

    const refresh = this.sessions.prepareRefreshToken(user.id, this.sessions.newFamilyId());
    await this.refreshTokens.create(refresh.record);
    return this.sessions.toSession(user, refresh, existing === null);
  }

  private async checkCode(email: EmailAddress, code: string): Promise<void> {
    const stored = await this.store.find(email);
    if (stored === null) {
      throw new OtpExpiredError();
    }
    if (stored.failedAttempts >= OTP_POLICY.maxVerifyAttempts) {
      throw new OtpAttemptsExceededError();
    }
    if (this.codec.matches(email, code, stored.codeHash)) {
      return;
    }

    const failedAttempts = await this.store.recordFailedAttempt(email);
    if (failedAttempts === null) {
      throw new OtpExpiredError();
    }
    const attemptsLeft = OTP_POLICY.maxVerifyAttempts - failedAttempts;
    if (attemptsLeft <= 0) {
      // Burn the code so it can't be brute-forced; the member must request a new one.
      await this.store.consume(email);
      throw new OtpAttemptsExceededError();
    }
    throw new InvalidOtpError(attemptsLeft);
  }
}
