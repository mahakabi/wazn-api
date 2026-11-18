import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** The one error shape every endpoint returns: `{ code, message, details? }`. */
export interface ApiErrorBody {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
}

/** OpenAPI schema for {@link ApiErrorBody}. */
export class ApiErrorDto implements ApiErrorBody {
  @ApiProperty({ example: 'VALIDATION_FAILED' })
  code!: string;

  @ApiProperty({ example: 'Request validation failed' })
  message!: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  details?: Record<string, unknown>;
}

/** Codes produced by the transport layer itself (not by a domain error). */
export const TransportErrorCode = {
  ValidationFailed: 'VALIDATION_FAILED',
  BadRequest: 'BAD_REQUEST',
  Unauthorized: 'UNAUTHORIZED',
  Forbidden: 'FORBIDDEN',
  NotFound: 'NOT_FOUND',
  Conflict: 'CONFLICT',
  RateLimited: 'RATE_LIMITED',
  Internal: 'INTERNAL_ERROR',
} as const;
