export type ProbeStatus = 'up' | 'down';

export interface HealthReport {
  readonly status: 'ok' | 'degraded';
  readonly checks: Readonly<Record<string, ProbeStatus>>;
}
