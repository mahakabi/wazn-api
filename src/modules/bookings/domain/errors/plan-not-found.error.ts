import { DomainError } from '../../../../common/domain/domain-error';
import { ErrorKind } from '../../../../common/domain/error-kind';

export class PlanNotFoundError extends DomainError {
  readonly code = 'PLAN_NOT_FOUND';
  readonly kind = ErrorKind.NotFound;

  constructor(planId: string) {
    super('Plan not found', { planId });
  }
}
