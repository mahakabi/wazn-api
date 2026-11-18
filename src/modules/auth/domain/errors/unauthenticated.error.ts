import { DomainError } from '../../../../common/domain/domain-error';
import { ErrorKind } from '../../../../common/domain/error-kind';

export class UnauthenticatedError extends DomainError {
  readonly code = 'UNAUTHENTICATED';
  readonly kind = ErrorKind.Unauthorized;

  constructor() {
    super('Sign in to continue');
  }
}
