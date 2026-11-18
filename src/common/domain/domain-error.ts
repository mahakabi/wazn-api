import { type ErrorKind } from './error-kind';

export type ErrorDetails = Record<string, unknown>;

/**
 * Base class for every expected, typed failure in the domain.
 * `code` is a stable machine-readable identifier (e.g. `BOOKING_EXPIRED`) that
 * clients map to localized messages; `message` is an English fallback.
 */
export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly kind: ErrorKind;

  protected constructor(
    message: string,
    readonly details?: ErrorDetails,
  ) {
    super(message);
    this.name = new.target.name;
  }
}
