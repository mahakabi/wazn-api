import { DomainError } from '../../../../common/domain/domain-error';
import { ErrorKind } from '../../../../common/domain/error-kind';

export class ForbiddenError extends DomainError {
  readonly code = 'FORBIDDEN';
  readonly kind = ErrorKind.Forbidden;

  constructor() {
    super("You don't have access to this");
  }
}
