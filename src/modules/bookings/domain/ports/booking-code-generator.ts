import { type BookingCode } from '../booking-code';

export interface BookingCodeGenerator {
  generate(): BookingCode;
}

export const BOOKING_CODE_GENERATOR = Symbol('BOOKING_CODE_GENERATOR');
