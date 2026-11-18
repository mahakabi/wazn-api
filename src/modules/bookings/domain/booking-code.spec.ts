import { BOOKING_CODE_ALPHABET, BookingCode } from './booking-code';
import { InvalidBookingCodeError } from './errors/invalid-booking-code.error';

describe('BookingCode', () => {
  it('excludes look-alike characters from the alphabet', () => {
    expect(BOOKING_CODE_ALPHABET).not.toMatch(/[0O1I]/);
  });

  it.each(['WZ-7K42', 'wz-7k42', ' 7K42 ', 'wz7k42', 'WZ 7K42'])('normalizes %p', (raw) => {
    expect(BookingCode.parse(raw).value).toBe('WZ-7K42');
  });

  it.each(['WZ-7K4', 'WZ-7K420', 'WZ-0K42', 'WZ-IK42', 'AB-7K42', ''])('rejects %p', (raw) => {
    expect(() => BookingCode.parse(raw)).toThrow(InvalidBookingCodeError);
  });
});
