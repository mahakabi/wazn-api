const MS_PER_MINUTE = 60_000;

/**
 * Per-IP ceiling on /auth routes, on top of the per-phone OTP limits. In-memory, so it
 * applies per API instance; switch to Redis storage when running more than one.
 */
export const AUTH_THROTTLE = { ttl: MS_PER_MINUTE, limit: 20 } as const;
