import { RecordingEmailSender } from '../../../common/testing/recording-email.sender';
import { EmailAddress } from '../domain/email-address';
import { InvalidEmailError } from '../domain/errors/invalid-email.error';
import { OtpRateLimitedError } from '../domain/errors/otp-rate-limited.error';
import { RequestOtpUseCase } from './request-otp.use-case';
import { FakeOtpCodec } from './testing/fake-otp.codec';
import { InMemoryOtpStore } from './testing/in-memory-otp.store';
import { StubOtpRequestLimiter } from './testing/stub-otp-request.limiter';

const EMAIL = 'maha@example.com';

describe('RequestOtpUseCase', () => {
  let limiter: StubOtpRequestLimiter;
  let store: InMemoryOtpStore;
  let mailer: RecordingEmailSender;
  let useCase: RequestOtpUseCase;

  beforeEach(() => {
    limiter = new StubOtpRequestLimiter();
    store = new InMemoryOtpStore();
    mailer = new RecordingEmailSender();
    useCase = new RequestOtpUseCase(limiter, new FakeOtpCodec('482913'), store, mailer);
  });

  it('stores only the hash and emails the code to the normalized address', async () => {
    const result = await useCase.execute({ email: '  Maha@Example.com ', locale: 'en' });

    expect(result).toEqual({ expiresInSeconds: 300, resendAfterSeconds: 60 });
    expect(store.entries.get(EMAIL)).toEqual({
      codeHash: `hash(${EMAIL}:482913)`,
      failedAttempts: 0,
    });
    expect(mailer.sent).toHaveLength(1);
    expect(mailer.sent[0]).toMatchObject({
      to: EMAIL,
      subject: 'Your Wazn sign-in code: 482913',
    });
    expect(mailer.lastCodeFor(EMAIL)).toBe('482913');
  });

  it('sends the Arabic, right-to-left email for locale ar', async () => {
    await useCase.execute({ email: EMAIL, locale: 'ar' });

    expect(mailer.sent[0]?.subject).toBe('رمز الدخول إلى وزن: 482913');
    expect(mailer.sent[0]?.html).toContain('dir="rtl"');
  });

  it('refuses during the cooldown without sending an email', async () => {
    limiter.decision = { allowed: false, reason: 'cooldown', retryAfterSeconds: 42 };

    const attempt = useCase.execute({ email: EMAIL, locale: 'en' });

    await expect(attempt).rejects.toBeInstanceOf(OtpRateLimitedError);
    await expect(attempt).rejects.toMatchObject({
      code: 'OTP_COOLDOWN',
      details: { retryAfterSeconds: 42 },
    });
    expect(mailer.sent).toHaveLength(0);
    expect(await store.find(EmailAddress.parse(EMAIL))).toBeNull();
  });

  it('reports the hourly limit with its own code', async () => {
    limiter.decision = { allowed: false, reason: 'hourly_limit', retryAfterSeconds: 1800 };

    await expect(useCase.execute({ email: EMAIL, locale: 'en' })).rejects.toMatchObject({
      code: 'OTP_TOO_MANY_REQUESTS',
    });
  });

  it('rejects an invalid email before touching the limiter', async () => {
    const spy = jest.spyOn(limiter, 'tryAcquire');

    await expect(useCase.execute({ email: 'not-an-email', locale: 'en' })).rejects.toBeInstanceOf(
      InvalidEmailError,
    );
    expect(spy).not.toHaveBeenCalled();
  });
});
