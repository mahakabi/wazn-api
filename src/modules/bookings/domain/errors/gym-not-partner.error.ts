import { DomainError } from '../../../../common/domain/domain-error';
import { ErrorKind } from '../../../../common/domain/error-kind';

/** Business rule #7: only partner gyms accept bookings; listed gyms are info only. */
export class GymNotPartnerError extends DomainError {
  readonly code = 'GYM_NOT_PARTNER';
  readonly kind = ErrorKind.BusinessRule;

  constructor() {
    super('This gym does not take bookings through Wazn yet');
  }
}
