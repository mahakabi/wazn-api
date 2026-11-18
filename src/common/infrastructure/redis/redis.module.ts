import { Global, Inject, Module, type OnApplicationShutdown } from '@nestjs/common';
import { Redis } from 'ioredis';
import { AppConfigService } from '../../../config/app-config.service';
import { REDIS_CLIENT } from './redis-client';

const MAX_RETRIES_PER_REQUEST = 3;

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (config: AppConfigService): Redis =>
        new Redis(config.get('REDIS_URL'), { maxRetriesPerRequest: MAX_RETRIES_PER_REQUEST }),
      inject: [AppConfigService],
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule implements OnApplicationShutdown {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async onApplicationShutdown(): Promise<void> {
    await this.redis.quit();
  }
}
