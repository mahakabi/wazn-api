import { FixedClock } from '../../../common/testing/fixed-clock';
import { InvalidOtpError } from '../domain/errors/invalid-otp.error';
import { OtpAttemptsExceededError } from '../domain/errors/otp-attempts-exceeded.error';
import { OtpExpiredError } from '../domain/errors/otp-expired.error';
import { EmailAddress } from '../domain/email-address';
import { SessionIssuer } from './session-issuer';
import { FakeAccessTokenService } from './testing/fake-access-token.service';
import { FakeOtpCodec } from './testing/fake-otp.codec';
import { InMemoryOtpStore } from './testing/in-memory-otp.store';
import { InMemoryRefreshTokenRepository } from './testing/in-memory-refresh-token.repository';
import { InMemoryUserRepository } from './testing/in-memory-user.repository';
import { SequentialTokenGenerator } from './testing/sequential-token.generator';
import { VerifyOtpUseCase } from './verify-otp.use-case';

const EMAIL = EmailAddress.parse('maha@example.com');
const CODE = '123456';

describe('VerifyOtpUseCase', () => {
  let store: InMemoryOtpStore;
  let users: InMemoryUserRepository;
  let refreshTokens: InMemoryRefreshTokenRepository;
  let useCase: VerifyOtpUseCase;
  const codec = new FakeOtpCodec();

  beforeEach(async () => {
    store = new InMemoryOtpStore();
    users = new InMemoryUserRepository();
    refreshTokens = new InMemoryRefreshTokenRepository();
    const sessions = new SessionIssuer(
      new FakeAccessTokenService(),
      new SequentialTokenGenerator(),
      new FixedClock(),
    );
    useCase = new VerifyOtpUseCase(store, codec, users, refreshTokens, sessions);
    await store.save(EMAIL, codec.hash(EMAIL, CODE));
  });

  const verify = (code: string) =>
    useCase.execute({ email: 'Maha@Example.com', code, locale: 'ar' });

  it('creates a member on first sign-in and issues a session', async () => {
    const session = await verify(CODE);

    expect(session.isNewUser).toBe(true);
    expect(session.user).toMatchObject({
      email: 'maha@example.com',
      phone: null,
      role: 'MEMBER',
      locale: 'ar',
    });
    expect(session.accessToken).toBe(`access:${session.user.id}:MEMBER`);
    expect(session.accessTokenExpiresIn).toBe(900);
    expect(session.refreshTokenExpiresAt.toISOString()).toBe('2026-12-18T12:00:00.000Z');
    expect(refreshTokens.rows).toHaveLength(1);
    expect(refreshTokens.rows[0]?.tokenHash).toBe(`hash(${session.refreshToken})`);
  });

  it('signs an existing user in without creating another', async () => {
    const existing = await users.createMember(EMAIL, 'en');

    const session = await verify(CODE);

    expect(session.isNewUser).toBe(false);
    expect(session.user.id).toBe(existing.id);
    expect(users.users).toHaveLength(1);
  });

  it('makes the code single-use', async () => {
    await verify(CODE);

    await expect(verify(CODE)).rejects.toBeInstanceOf(OtpExpiredError);
  });

  it('reports attempts left on a wrong code', async () => {
    await expect(verify('000000')).rejects.toMatchObject({
      code: 'INVALID_OTP',
      details: { attemptsLeft: 4 },
    });
  });

  it('burns the code after the 5th wrong attempt, even if the right code follows', async () => {
    for (let attempt = 1; attempt <= 4; attempt += 1) {
      await expect(verify('000000')).rejects.toBeInstanceOf(InvalidOtpError);
    }
    await expect(verify('000000')).rejects.toBeInstanceOf(OtpAttemptsExceededError);

    await expect(verify(CODE)).rejects.toBeInstanceOf(OtpExpiredError);
  });

  it('fails when no code was requested', async () => {
    await store.consume(EMAIL);

    await expect(verify(CODE)).rejects.toBeInstanceOf(OtpExpiredError);
  });
});
