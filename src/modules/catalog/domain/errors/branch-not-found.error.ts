import { DomainError } from '../../../../common/domain/domain-error';
import { ErrorKind } from '../../../../common/domain/error-kind';

export class BranchNotFoundError extends DomainError {
  readonly code = 'BRANCH_NOT_FOUND';
  readonly kind = ErrorKind.NotFound;

  constructor(branchId: string) {
    super('Gym not found', { branchId });
  }
}
