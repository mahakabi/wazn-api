import { DomainError } from '../../../../common/domain/domain-error';
import { ErrorKind } from '../../../../common/domain/error-kind';

export class InvalidRefreshTokenError extends DomainError {
  readonly code = 'INVALID_REFRESH_TOKEN';
  readonly kind = ErrorKind.Unauthorized;

  constructor() {
    super('Session expired. Please sign in again');
  }
}
