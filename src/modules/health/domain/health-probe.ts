/** A dependency the API needs to serve traffic (database, redis, ...). */
export interface HealthProbe {
  readonly name: string;
  isHealthy(): Promise<boolean>;
}

export const HEALTH_PROBES = Symbol('HEALTH_PROBES');
