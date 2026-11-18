import { type AppConfigService } from '../../../config/app-config.service';
import { EmailAddress } from '../domain/email-address';
import { HmacOtpCodec } from './hmac-otp.codec';

describe('HmacOtpCodec', () => {
  const config = { get: () => 'x'.repeat(32) } as unknown as AppConfigService;
  const codec = new HmacOtpCodec(config);
  const email = EmailAddress.parse('maha@example.com');

  it('generates fixed-length numeric codes', () => {
    for (let index = 0; index < 50; index += 1) {
      expect(codec.generate(6)).toMatch(/^\d{6}$/);
    }
  });

  it('matches only the same code for the same address', () => {
    const hash = codec.hash(email, '123456');

    expect(hash).not.toContain('123456');
    expect(codec.matches(email, '123456', hash)).toBe(true);
    expect(codec.matches(email, '123457', hash)).toBe(false);
    expect(codec.matches(EmailAddress.parse('other@example.com'), '123456', hash)).toBe(false);
  });
});
