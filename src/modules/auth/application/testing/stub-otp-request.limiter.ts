import { type OtpRequestDecision } from '../../domain/otp-request-decision';
import { type OtpRequestLimiter } from '../../domain/ports/otp-request-limiter';

export class StubOtpRequestLimiter implements OtpRequestLimiter {
  decision: OtpRequestDecision = { allowed: true };

  tryAcquire(): Promise<OtpRequestDecision> {
    return Promise.resolve(this.decision);
  }
}
