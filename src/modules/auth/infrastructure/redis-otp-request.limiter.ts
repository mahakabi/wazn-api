import { Inject, Injectable } from '@nestjs/common';
import { type Redis } from 'ioredis';
import { REDIS_CLIENT } from '../../../common/infrastructure/redis/redis-client';
import { type OtpRequestDecision } from '../domain/otp-request-decision';
import { type EmailAddress } from '../domain/email-address';
import {
  type OtpRequestLimiter,
  type OtpRequestLimiterLimits,
} from '../domain/ports/otp-request-limiter';

const SECONDS_PER_HOUR = 3600;

/**
 * One Lua script so check-and-record is atomic across API instances.
 * Returns {0} = allowed, {1, ttl} = cooldown, {2, ttl} = hourly limit.
 */
const TRY_ACQUIRE = `
local cooldownTtl = redis.call('TTL', KEYS[1])
if cooldownTtl > 0 then return {1, cooldownTtl} end
local count = redis.call('INCR', KEYS[2])
if count == 1 then redis.call('EXPIRE', KEYS[2], ARGV[2]) end
if count > tonumber(ARGV[3]) then return {2, redis.call('TTL', KEYS[2])} end
redis.call('SET', KEYS[1], '1', 'EX', ARGV[1])
return {0, 0}
`;

const ALLOWED = 0;
const COOLDOWN = 1;

@Injectable()
export class RedisOtpRequestLimiter implements OtpRequestLimiter {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async tryAcquire(
    email: EmailAddress,
    limits: OtpRequestLimiterLimits,
  ): Promise<OtpRequestDecision> {
    const result = (await this.redis.eval(
      TRY_ACQUIRE,
      2,
      `otp:cooldown:${email.value}`,
      `otp:hourly:${email.value}`,
      limits.cooldownSeconds,
      SECONDS_PER_HOUR,
      limits.maxPerHour,
    )) as [number, number];

    const [status, retryAfterSeconds] = result;
    if (status === ALLOWED) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: status === COOLDOWN ? 'cooldown' : 'hourly_limit',
      retryAfterSeconds,
    };
  }
}
