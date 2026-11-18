import { DomainError } from '../../../../common/domain/domain-error';
import { ErrorKind } from '../../../../common/domain/error-kind';

export class InvalidOtpError extends DomainError {
  readonly code = 'INVALID_OTP';
  readonly kind = ErrorKind.Unauthorized;

  constructor(attemptsLeft: number) {
    super('The code is incorrect', { attemptsLeft });
  }
}
