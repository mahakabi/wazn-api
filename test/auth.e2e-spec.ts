import { E2eContext } from './e2e-context';

// Reserved for this suite so it never collides with seed data.
const EMAIL_INPUT = 'E2E.Auth@Wazn.Test';
const EMAIL = 'e2e.auth@wazn.test';

interface SessionBody {
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
  user: { id: string; email: string; phone: string | null; role: string; locale: string };
}

describe('Auth (e2e): email OTP sign-in → me → refresh rotation → logout', () => {
  let ctx: E2eContext;

  const http = () => ctx.http();

  async function resetAccount(): Promise<void> {
    await ctx.deleteMembers([EMAIL]);
    const keys = await ctx.redis.keys(`otp:*:${EMAIL}`);
    if (keys.length > 0) await ctx.redis.del(...keys);
  }

  async function requestCode(): Promise<string> {
    await http()
      .post('/v1/auth/otp/request')
      .send({ email: EMAIL_INPUT, locale: 'ar' })
      .expect(200);
    const code = ctx.mailer.lastCodeFor(EMAIL);
    if (code === undefined) throw new Error('No OTP email captured');
    return code;
  }

  async function signIn(): Promise<SessionBody> {
    const code = await requestCode();
    const response = await http()
      .post('/v1/auth/otp/verify')
      .send({ email: EMAIL_INPUT, code, locale: 'ar' })
      .expect(200);
    return response.body as SessionBody;
  }

  beforeAll(async () => {
    ctx = await E2eContext.start();
  });

  beforeEach(resetAccount);

  afterAll(async () => {
    // Always release connections, even if cleanup fails, so Jest can exit.
    try {
      await resetAccount();
    } finally {
      await ctx.stop();
    }
  });

  it('signs a new member in and returns their profile on /me', async () => {
    const session = await signIn();

    expect(session.isNewUser).toBe(true);
    expect(session.user).toMatchObject({ email: EMAIL, phone: null, role: 'MEMBER', locale: 'ar' });

    const me = await http()
      .get('/v1/me')
      .set('Authorization', `Bearer ${session.accessToken}`)
      .expect(200);
    expect(me.body).toMatchObject({ id: session.user.id, email: EMAIL });
  });

  it('requires a valid access token on protected routes', async () => {
    const missing = await http().get('/v1/me').expect(401);
    expect(missing.body).toEqual({ code: 'UNAUTHENTICATED', message: 'Sign in to continue' });

    await http().get('/v1/me').set('Authorization', 'Bearer not-a-jwt').expect(401);
  });

  it('enforces the resend cooldown per address (case-insensitive)', async () => {
    await requestCode();

    const second = await http()
      .post('/v1/auth/otp/request')
      .send({ email: ` ${EMAIL} ` })
      .expect(429);
    expect(second.body).toMatchObject({ code: 'OTP_COOLDOWN' });
  });

  it('rejects a wrong code with attempts left', async () => {
    const code = await requestCode();
    const wrong = code === '000000' ? '111111' : '000000';

    const response = await http()
      .post('/v1/auth/otp/verify')
      .send({ email: EMAIL_INPUT, code: wrong })
      .expect(401);
    expect(response.body).toMatchObject({ code: 'INVALID_OTP', details: { attemptsLeft: 4 } });
  });

  it('rotates refresh tokens and revokes the family when an old one is reused', async () => {
    const session = await signIn();

    const refreshed = await http()
      .post('/v1/auth/refresh')
      .send({ refreshToken: session.refreshToken })
      .expect(200);
    const rotated = refreshed.body as SessionBody;
    expect(rotated.refreshToken).not.toBe(session.refreshToken);

    const reuse = await http()
      .post('/v1/auth/refresh')
      .send({ refreshToken: session.refreshToken })
      .expect(401);
    expect(reuse.body).toMatchObject({ code: 'INVALID_REFRESH_TOKEN' });

    await http().post('/v1/auth/refresh').send({ refreshToken: rotated.refreshToken }).expect(401);
  });

  it('logs out by revoking the refresh token', async () => {
    const session = await signIn();

    await http().post('/v1/auth/logout').send({ refreshToken: session.refreshToken }).expect(204);
    await http().post('/v1/auth/refresh').send({ refreshToken: session.refreshToken }).expect(401);
  });

  it('rejects an invalid email with a domain error code', async () => {
    const response = await http()
      .post('/v1/auth/otp/request')
      .send({ email: 'not-an-email' })
      .expect(400);
    expect(response.body).toMatchObject({ code: 'INVALID_EMAIL' });
  });

  it('validates the request body', async () => {
    const response = await http()
      .post('/v1/auth/otp/verify')
      .send({ email: EMAIL_INPUT, code: '12', extra: true })
      .expect(400);
    const body = response.body as { code: string; details: { fields: Record<string, string[]> } };
    expect(body.code).toBe('VALIDATION_FAILED');
    expect(Object.keys(body.details.fields).sort()).toEqual(['code', 'extra']);
  });
});
