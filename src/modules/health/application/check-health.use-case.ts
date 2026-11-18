import { Inject, Injectable } from '@nestjs/common';
import { HEALTH_PROBES, type HealthProbe } from '../domain/health-probe';
import { type HealthReport, type ProbeStatus } from '../domain/health-report';

@Injectable()
export class CheckHealthUseCase {
  constructor(@Inject(HEALTH_PROBES) private readonly probes: readonly HealthProbe[]) {}

  async execute(): Promise<HealthReport> {
    const results = await Promise.all(
      this.probes.map(async (probe): Promise<[string, ProbeStatus]> => {
        // A probe that throws is "down", not a 500 from the health endpoint itself.
        const healthy = await probe.isHealthy().catch(() => false);
        return [probe.name, healthy ? 'up' : 'down'];
      }),
    );
    const checks = Object.fromEntries(results);
    const allUp = results.every(([, status]) => status === 'up');
    return { status: allUp ? 'ok' : 'degraded', checks };
  }
}
