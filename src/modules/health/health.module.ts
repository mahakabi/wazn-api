import { Module } from '@nestjs/common';
import { CheckHealthUseCase } from './application/check-health.use-case';
import { HEALTH_PROBES, type HealthProbe } from './domain/health-probe';
import { DatabaseHealthProbe } from './infrastructure/database.health-probe';
import { HealthController } from './presentation/health.controller';

@Module({
  controllers: [HealthController],
  providers: [
    DatabaseHealthProbe,
    {
      provide: HEALTH_PROBES,
      useFactory: (database: DatabaseHealthProbe): HealthProbe[] => [database],
      inject: [DatabaseHealthProbe],
    },
    CheckHealthUseCase,
  ],
})
export class HealthModule {}
