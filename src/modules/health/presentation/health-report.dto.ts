import { ApiProperty } from '@nestjs/swagger';
import { type HealthReport, type ProbeStatus } from '../domain/health-report';

export class HealthReportDto implements HealthReport {
  @ApiProperty({ enum: ['ok', 'degraded'], example: 'ok' })
  status!: 'ok' | 'degraded';

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'string', enum: ['up', 'down'] },
    example: { database: 'up' },
  })
  checks!: Record<string, ProbeStatus>;
}
