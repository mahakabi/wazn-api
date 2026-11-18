export interface StoredOtp {
  readonly codeHash: string;
  readonly failedAttempts: number;
}
