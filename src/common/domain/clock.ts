/** Source of "now", injected so time-based rules (expiry, rotation) are testable. */
export interface Clock {
  now(): Date;
}

export const CLOCK = Symbol('CLOCK');
