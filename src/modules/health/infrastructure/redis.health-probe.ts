import { Inject, Injectable } from '@nestjs/common';
import { type Redis } from 'ioredis';
import { REDIS_CLIENT } from '../../../common/infrastructure/redis/redis-client';
import { type HealthProbe } from '../domain/health-probe';

@Injectable()
export class RedisHealthProbe implements HealthProbe {
  readonly name = 'redis';

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async isHealthy(): Promise<boolean> {
    // ping() rejects when Redis is unreachable; the use case turns that into "down".
    await this.redis.ping();
    return true;
  }
}
