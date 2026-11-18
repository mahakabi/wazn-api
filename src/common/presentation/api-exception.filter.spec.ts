import { HttpStatus, Logger, NotFoundException } from '@nestjs/common';
import { DomainError } from '../domain/domain-error';
import { ErrorKind } from '../domain/error-kind';
import { ApiExceptionFilter } from './api-exception.filter';
import { RequestValidationException } from './request-validation.exception';

class BookingExpiredError extends DomainError {
  readonly code = 'BOOKING_EXPIRED';
  readonly kind = ErrorKind.BusinessRule;

  constructor(code: string) {
    super('Booking code has expired', { bookingCode: code });
  }
}

describe('ApiExceptionFilter', () => {
  const filter = new ApiExceptionFilter();

  beforeAll(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  it('maps a domain error to its kind status, code and details', () => {
    const { status, body } = filter.toApiError(new BookingExpiredError('WZ-7K42'));

    expect(status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(body).toEqual({
      code: 'BOOKING_EXPIRED',
      message: 'Booking code has expired',
      details: { bookingCode: 'WZ-7K42' },
    });
  });

  it('maps request validation errors with per-field details', () => {
    const { status, body } = filter.toApiError(
      new RequestValidationException({ phone: ['phone must be a valid phone number'] }),
    );

    expect(status).toBe(HttpStatus.BAD_REQUEST);
    expect(body.code).toBe('VALIDATION_FAILED');
    expect(body.details).toEqual({ fields: { phone: ['phone must be a valid phone number'] } });
  });

  it('maps Nest 4xx exceptions to a stable code without details', () => {
    const { status, body } = filter.toApiError(new NotFoundException('Cannot GET /nope'));

    expect(status).toBe(HttpStatus.NOT_FOUND);
    expect(body).toEqual({ code: 'NOT_FOUND', message: 'Cannot GET /nope' });
  });

  it('hides unexpected errors behind INTERNAL_ERROR', () => {
    const { status, body } = filter.toApiError(new Error('db password is hunter2'));

    expect(status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(body).toEqual({ code: 'INTERNAL_ERROR', message: 'Something went wrong' });
  });
});
