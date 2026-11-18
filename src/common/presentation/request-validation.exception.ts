import { BadRequestException } from '@nestjs/common';

/** Thrown by the global ValidationPipe; carries per-field messages for the error filter. */
export class RequestValidationException extends BadRequestException {
  constructor(readonly fields: Record<string, string[]>) {
    super('Request validation failed');
  }
}
