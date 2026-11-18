import { ValidationPipe } from '@nestjs/common';
import { RequestValidationException } from './request-validation.exception';
import { flattenValidationErrors } from './validation-error';

export function createGlobalValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors) => new RequestValidationException(flattenValidationErrors(errors)),
  });
}
