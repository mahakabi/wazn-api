export type OtpRequestDecision =
  | { readonly allowed: true }
  | {
      readonly allowed: false;
      readonly reason: 'cooldown' | 'hourly_limit';
      readonly retryAfterSeconds: number;
    };
