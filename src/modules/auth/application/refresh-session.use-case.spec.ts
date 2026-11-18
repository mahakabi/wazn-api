import { FixedClock } from '../../../common/testing/fixed-clock';
import { InvalidRefreshTokenError } from '../domain/errors/invalid-refresh-token.error';
import { EmailAddress } from '../domain/email-address';
import { type Session } from '../domain/session';
import { RefreshSessionUseCase } from './refresh-session.use-case';
import { SessionIssuer } from './session-issuer';
import { SignOutUseCase } from './sign-out.use-case';
import { FakeAccessTokenService } from './testing/fake-access-token.service';
import { InMemoryRefreshTokenRepository } from './testing/in-memory-refresh-token.repository';
import { InMemoryUserRepository } from './testing/in-memory-user.repository';
import { SequentialTokenGenerator } from './testing/sequential-token.generator';

const THIRTY_DAYS_SECONDS = 30 * 24 * 60 * 60;

describe('RefreshSessionUseCase', () => {
  let clock: FixedClock;
  let refreshTokens: InMemoryRefreshTokenRepository;
  let users: InMemoryUserRepository;
  let sessions: SessionIssuer;
  let useCase: RefreshSessionUseCase;
  let signIn: Session;

  beforeEach(async () => {
    clock = new FixedClock();
    refreshTokens = new InMemoryRefreshTokenRepository();
    users = new InMemoryUserRepository();
    const tokens = new SequentialTokenGenerator();
    sessions = new SessionIssuer(new FakeAccessTokenService(), tokens, clock);
    useCase = new RefreshSessionUseCase(refreshTokens, tokens, users, clock, sessions);

    const user = await users.createMember(EmailAddress.parse('maha@example.com'), 'en');
    const refresh = sessions.prepareRefreshToken(user.id, sessions.newFamilyId());
    await refreshTokens.create(refresh.record);
    signIn = await sessions.toSession(user, refresh, true);
  });

  it('rotates: returns a new refresh token and revokes the old one', async () => {
    const refreshed = await useCase.execute(signIn.refreshToken);

    expect(refreshed.refreshToken).not.toBe(signIn.refreshToken);
    expect(refreshed.isNewUser).toBe(false);
    const familyId = refreshTokens.rows[0]?.familyId ?? '';
    expect(refreshTokens.activeIn(familyId)).toHaveLength(1);
    expect(refreshTokens.activeIn(familyId)[0]?.tokenHash).toBe(`hash(${refreshed.refreshToken})`);
  });

  it('treats reuse of a rotated token as theft and revokes the whole family', async () => {
    const refreshed = await useCase.execute(signIn.refreshToken);

    await expect(useCase.execute(signIn.refreshToken)).rejects.toBeInstanceOf(
      InvalidRefreshTokenError,
    );
    // The legitimate latest token is now dead too.
    await expect(useCase.execute(refreshed.refreshToken)).rejects.toBeInstanceOf(
      InvalidRefreshTokenError,
    );
  });

  it('rejects an expired token', async () => {
    clock.advanceSeconds(THIRTY_DAYS_SECONDS);

    await expect(useCase.execute(signIn.refreshToken)).rejects.toBeInstanceOf(
      InvalidRefreshTokenError,
    );
  });

  it('rejects an unknown token', async () => {
    await expect(useCase.execute('nope')).rejects.toBeInstanceOf(InvalidRefreshTokenError);
  });

  it('rejects tokens after sign-out', async () => {
    await new SignOutUseCase(refreshTokens, new SequentialTokenGenerator(), clock).execute(
      signIn.refreshToken,
    );

    await expect(useCase.execute(signIn.refreshToken)).rejects.toBeInstanceOf(
      InvalidRefreshTokenError,
    );
  });
});
