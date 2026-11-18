import { type HealthProbe } from '../domain/health-probe';
import { CheckHealthUseCase } from './check-health.use-case';

const probe = (name: string, isHealthy: () => Promise<boolean>): HealthProbe => ({
  name,
  isHealthy,
});

describe('CheckHealthUseCase', () => {
  it('is ok when every probe is up', async () => {
    const useCase = new CheckHealthUseCase([
      probe('database', () => Promise.resolve(true)),
      probe('redis', () => Promise.resolve(true)),
    ]);

    await expect(useCase.execute()).resolves.toEqual({
      status: 'ok',
      checks: { database: 'up', redis: 'up' },
    });
  });

  it('is degraded when a probe throws, without rejecting', async () => {
    const useCase = new CheckHealthUseCase([
      probe('database', () => Promise.reject(new Error('connection refused'))),
      probe('redis', () => Promise.resolve(true)),
    ]);

    await expect(useCase.execute()).resolves.toEqual({
      status: 'degraded',
      checks: { database: 'down', redis: 'up' },
    });
  });
});
