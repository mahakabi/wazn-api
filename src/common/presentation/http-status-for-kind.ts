import { HttpStatus } from '@nestjs/common';
import { ErrorKind } from '../domain/error-kind';

const STATUS_BY_KIND: Record<ErrorKind, HttpStatus> = {
  [ErrorKind.Validation]: HttpStatus.BAD_REQUEST,
  [ErrorKind.Unauthorized]: HttpStatus.UNAUTHORIZED,
  [ErrorKind.Forbidden]: HttpStatus.FORBIDDEN,
  [ErrorKind.NotFound]: HttpStatus.NOT_FOUND,
  [ErrorKind.Conflict]: HttpStatus.CONFLICT,
  [ErrorKind.BusinessRule]: HttpStatus.UNPROCESSABLE_ENTITY,
  [ErrorKind.RateLimited]: HttpStatus.TOO_MANY_REQUESTS,
};

export function httpStatusForKind(kind: ErrorKind): HttpStatus {
  return STATUS_BY_KIND[kind];
}
