import { randomInt } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { BOOKING_CODE_ALPHABET, BOOKING_CODE_LENGTH, BookingCode } from '../domain/booking-code';
import { type BookingCodeGenerator } from '../domain/ports/booking-code-generator';

/** CSPRNG so codes can't be predicted from earlier ones. */
@Injectable()
export class RandomBookingCodeGenerator implements BookingCodeGenerator {
  generate(): BookingCode {
    let suffix = '';
    for (let index = 0; index < BOOKING_CODE_LENGTH; index += 1) {
      suffix += BOOKING_CODE_ALPHABET.charAt(randomInt(BOOKING_CODE_ALPHABET.length));
    }
    return BookingCode.fromSuffix(suffix);
  }
}
