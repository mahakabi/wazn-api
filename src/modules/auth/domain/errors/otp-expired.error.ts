import { DomainError } from '../../../../common/domain/domain-error';
import { ErrorKind } from '../../../../common/domain/error-kind';

/** No active code for this phone: never requested, expired, already used, or locked out. */
export class OtpExpiredError extends DomainError {
  readonly code = 'OTP_EXPIRED';
  readonly kind = ErrorKind.Unauthorized;

  constructor() {
    super('The code has expired. Request a new one');
  }
}
