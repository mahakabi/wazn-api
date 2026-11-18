/** Limits for one-time sign-in codes. Security constants, not admin settings. */
export const OTP_POLICY = {
  codeLength: 6,
  ttlSeconds: 5 * 60,
  maxVerifyAttempts: 5,
  resendCooldownSeconds: 60,
  maxRequestsPerHour: 5,
} as const;
