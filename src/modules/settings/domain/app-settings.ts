/** Admin-tunable business values, parsed and typed. */
export interface AppSettings {
  /** Decimal string with up to 3 places, e.g. "0.10". Kept as text so it never becomes a float. */
  readonly defaultCommissionRate: string;
  readonly codeValidityDays: number;
  readonly priceFreshnessDays: number;
}
