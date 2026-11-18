import { Inject, Injectable } from '@nestjs/common';
import { type Redis } from 'ioredis';
import { REDIS_CLIENT } from '../../../common/infrastructure/redis/redis-client';
import { type EmailAddress } from '../domain/email-address';
import { type OtpStore } from '../domain/ports/otp-store';
import { type StoredOtp } from '../domain/stored-otp';

const FIELD_HASH = 'hash';
const FIELD_ATTEMPTS = 'attempts';

// HINCRBY on a missing key would recreate it without a TTL; only increment if it still exists.
const INCREMENT_IF_EXISTS = `
if redis.call('EXISTS', KEYS[1]) == 0 then return -1 end
return redis.call('HINCRBY', KEYS[1], ARGV[1], 1)
`;

@Injectable()
export class RedisOtpStore implements OtpStore {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async save(email: EmailAddress, codeHash: string, ttlSeconds: number): Promise<void> {
    const key = this.key(email);
    await this.redis
      .multi()
      .del(key)
      .hset(key, FIELD_HASH, codeHash, FIELD_ATTEMPTS, 0)
      .expire(key, ttlSeconds)
      .exec();
  }

  async find(email: EmailAddress): Promise<StoredOtp | null> {
    const fields = await this.redis.hgetall(this.key(email));
    const codeHash = fields[FIELD_HASH];
    if (codeHash === undefined) {
      return null;
    }
    return { codeHash, failedAttempts: Number(fields[FIELD_ATTEMPTS] ?? 0) };
  }

  async recordFailedAttempt(email: EmailAddress): Promise<number | null> {
    const result = await this.redis.eval(INCREMENT_IF_EXISTS, 1, this.key(email), FIELD_ATTEMPTS);
    const attempts = Number(result);
    return attempts < 0 ? null : attempts;
  }

  async consume(email: EmailAddress): Promise<boolean> {
    return (await this.redis.del(this.key(email))) === 1;
  }

  private key(email: EmailAddress): string {
    return `otp:code:${email.value}`;
  }
}
