import { DomainError } from '../../../../common/domain/domain-error';
import { ErrorKind } from '../../../../common/domain/error-kind';

export class OtpAttemptsExceededError extends DomainError {
  readonly code = 'OTP_ATTEMPTS_EXCEEDED';
  readonly kind = ErrorKind.RateLimited;

  constructor() {
    super('Too many incorrect attempts. Request a new code');
  }
}
