import { type OtpRequestDecision } from '../otp-request-decision';
import { type EmailAddress } from '../email-address';

export interface OtpRequestLimiterLimits {
  readonly cooldownSeconds: number;
  readonly maxPerHour: number;
}

/** Atomically checks and records an OTP request for a email. */
export interface OtpRequestLimiter {
  tryAcquire(email: EmailAddress, limits: OtpRequestLimiterLimits): Promise<OtpRequestDecision>;
}

export const OTP_REQUEST_LIMITER = Symbol('OTP_REQUEST_LIMITER');
