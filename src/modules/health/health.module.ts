import { Module } from '@nestjs/common';
import { CheckHealthUseCase } from './application/check-health.use-case';
import { HEALTH_PROBES, type HealthProbe } from './domain/health-probe';
import { DatabaseHealthProbe } from './infrastructure/database.health-probe';
import { RedisHealthProbe } from './infrastructure/redis.health-probe';
import { HealthController } from './presentation/health.controller';

@Module({
  controllers: [HealthController],
  providers: [
    DatabaseHealthProbe,
    RedisHealthProbe,
    {
      provide: HEALTH_PROBES,
      useFactory: (database: DatabaseHealthProbe, redis: RedisHealthProbe): HealthProbe[] => [
        database,
        redis,
      ],
      inject: [DatabaseHealthProbe, RedisHealthProbe],
    },
    CheckHealthUseCase,
  ],
})
export class HealthModule {}
