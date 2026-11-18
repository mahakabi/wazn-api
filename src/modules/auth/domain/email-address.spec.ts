import { EmailAddress } from './email-address';
import { InvalidEmailError } from './errors/invalid-email.error';

describe('EmailAddress', () => {
  it('trims and lower-cases', () => {
    expect(EmailAddress.parse('  Maha.Test@Example.COM ').value).toBe('maha.test@example.com');
  });

  it.each(['', 'maha', 'maha@', '@example.com', 'maha@example', 'ma ha@example.com'])(
    'rejects %p',
    (raw) => {
      expect(() => EmailAddress.parse(raw)).toThrow(InvalidEmailError);
    },
  );

  it('rejects addresses longer than 254 characters', () => {
    expect(() => EmailAddress.parse(`${'a'.repeat(250)}@x.co`)).toThrow(InvalidEmailError);
  });
});
