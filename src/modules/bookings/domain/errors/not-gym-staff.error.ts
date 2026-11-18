import { DomainError } from '../../../../common/domain/domain-error';
import { ErrorKind } from '../../../../common/domain/error-kind';

export class NotGymStaffError extends DomainError {
  readonly code = 'NOT_GYM_STAFF';
  readonly kind = ErrorKind.Forbidden;

  constructor() {
    super('Your account is not linked to a gym');
  }
}
