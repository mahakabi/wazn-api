import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { type Response } from 'express';
import { DomainError } from '../domain/domain-error';
import { type ApiErrorBody, TransportErrorCode } from './api-error';
import { httpStatusForKind } from './http-status-for-kind';
import { RequestValidationException } from './request-validation.exception';

const CODE_BY_STATUS: Partial<Record<number, string>> = {
  [HttpStatus.BAD_REQUEST]: TransportErrorCode.BadRequest,
  [HttpStatus.UNAUTHORIZED]: TransportErrorCode.Unauthorized,
  [HttpStatus.FORBIDDEN]: TransportErrorCode.Forbidden,
  [HttpStatus.NOT_FOUND]: TransportErrorCode.NotFound,
  [HttpStatus.CONFLICT]: TransportErrorCode.Conflict,
  [HttpStatus.TOO_MANY_REQUESTS]: TransportErrorCode.RateLimited,
};

/** Maps every thrown error to the single API error shape `{ code, message, details? }`. */
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const { status, body } = this.toApiError(exception);
    response.status(status).json(body);
  }

  toApiError(exception: unknown): { status: number; body: ApiErrorBody } {
    if (exception instanceof DomainError) {
      return {
        status: httpStatusForKind(exception.kind),
        body: this.body(exception.code, exception.message, exception.details),
      };
    }

    if (exception instanceof RequestValidationException) {
      return {
        status: HttpStatus.BAD_REQUEST,
        body: this.body(TransportErrorCode.ValidationFailed, exception.message, {
          fields: exception.fields,
        }),
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      if (status < (HttpStatus.INTERNAL_SERVER_ERROR as number)) {
        const code = CODE_BY_STATUS[status] ?? TransportErrorCode.BadRequest;
        return { status, body: this.body(code, exception.message) };
      }
    }

    // Unexpected: log the real error, never leak internals to the client.
    this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: this.body(TransportErrorCode.Internal, 'Something went wrong'),
    };
  }

  private body(code: string, message: string, details?: Record<string, unknown>): ApiErrorBody {
    return details === undefined ? { code, message } : { code, message, details };
  }
}
