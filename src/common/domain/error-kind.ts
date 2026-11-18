/**
 * Framework-free classification of domain errors. The presentation layer maps each
 * kind to an HTTP status; the domain never knows about HTTP.
 */
export enum ErrorKind {
  Validation = 'VALIDATION',
  Unauthorized = 'UNAUTHORIZED',
  Forbidden = 'FORBIDDEN',
  NotFound = 'NOT_FOUND',
  Conflict = 'CONFLICT',
  BusinessRule = 'BUSINESS_RULE',
  RateLimited = 'RATE_LIMITED',
}
