import { DomainError } from '../../../../common/domain/domain-error';
import { ErrorKind } from '../../../../common/domain/error-kind';

export class AlertBelowRequiredError extends DomainError {
  readonly code = 'ALERT_BELOW_REQUIRED';
  readonly kind = ErrorKind.Validation;

  constructor() {
    super('Set the price (whole SAR) to be alerted below');
  }
}
