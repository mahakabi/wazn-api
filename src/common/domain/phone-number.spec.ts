import { InvalidPhoneNumberError } from './errors/invalid-phone-number.error';
import { PhoneNumber } from './phone-number';

describe('PhoneNumber', () => {
  it.each([
    '0501234567',
    '501234567',
    '966501234567',
    '+966501234567',
    '00966501234567',
    '050 123 4567',
    '+966-50-123-4567',
    '٠٥٠١٢٣٤٥٦٧',
    '۰۵۰۱۲۳۴۵۶۷',
  ])('normalizes %s to E.164', (raw) => {
    expect(PhoneNumber.parse(raw).value).toBe('+966501234567');
  });

  it.each(['', '0401234567', '05012345', '050123456789', '+971501234567', 'abc'])(
    'rejects %p',
    (raw) => {
      expect(() => PhoneNumber.parse(raw)).toThrow(InvalidPhoneNumberError);
    },
  );

  it('masks for gym staff and formats locally', () => {
    const phone = PhoneNumber.parse('0501234412');

    expect(phone.masked).toBe('05XX XXX 412');
    expect(phone.local).toBe('0501234412');
  });
});
