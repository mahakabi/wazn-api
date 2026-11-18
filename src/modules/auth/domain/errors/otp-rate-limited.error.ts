import { DomainError } from '../../../../common/domain/domain-error';
import { ErrorKind } from '../../../../common/domain/error-kind';

/** Too soon after the last code (`OTP_COOLDOWN`) or too many codes this hour (`OTP_TOO_MANY_REQUESTS`). */
export class OtpRateLimitedError extends DomainError {
  readonly kind = ErrorKind.RateLimited;
  readonly code: 'OTP_COOLDOWN' | 'OTP_TOO_MANY_REQUESTS';

  constructor(reason: 'cooldown' | 'hourly_limit', retryAfterSeconds: number) {
    super('Please wait before requesting another code', { retryAfterSeconds });
    this.code = reason === 'cooldown' ? 'OTP_COOLDOWN' : 'OTP_TOO_MANY_REQUESTS';
  }
}
