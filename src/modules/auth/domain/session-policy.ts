const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_DAY = 24 * 60 * SECONDS_PER_MINUTE;

export const SESSION_POLICY = {
  accessTokenTtlSeconds: 15 * SECONDS_PER_MINUTE,
  refreshTokenTtlSeconds: 30 * SECONDS_PER_DAY,
} as const;
