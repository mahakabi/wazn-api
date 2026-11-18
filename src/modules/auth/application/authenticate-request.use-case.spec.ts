import { UnauthenticatedError } from '../domain/errors/unauthenticated.error';
import { AuthenticateRequestUseCase } from './authenticate-request.use-case';
import { FakeAccessTokenService } from './testing/fake-access-token.service';

describe('AuthenticateRequestUseCase', () => {
  const useCase = new AuthenticateRequestUseCase(new FakeAccessTokenService());

  it('returns the claims of a valid bearer token', async () => {
    await expect(useCase.execute('Bearer access:user_1:ADMIN')).resolves.toEqual({
      userId: 'user_1',
      role: 'ADMIN',
    });
  });

  it.each([undefined, '', 'access:user_1:MEMBER', 'Basic abc', 'Bearer garbage'])(
    'rejects %p',
    async (header) => {
      await expect(useCase.execute(header)).rejects.toBeInstanceOf(UnauthenticatedError);
    },
  );
});
