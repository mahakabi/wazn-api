const HALALAS_PER_RIYAL = 100;
const RATE_SCALE = 1000;
const RATE_SHAPE = /^(0|1)(?:\.(\d{1,3}))?$/;

/**
 * A commission rate with up to 3 decimals (matches `gyms.commission_rate` Decimal(4,3)).
 * Kept as an integer number of thousandths, so commission math never touches floats.
 */
export class CommissionRate {
  private constructor(private readonly thousandths: number) {}

  static parse(raw: string): CommissionRate {
    const match = RATE_SHAPE.exec(raw.trim());
    if (match === null) {
      throw new Error(`Invalid commission rate: ${raw}`);
    }
    const whole = Number(match[1]);
    const fraction = Number((match[2] ?? '').padEnd(3, '0'));
    const thousandths = whole * RATE_SCALE + fraction;
    if (thousandths > RATE_SCALE) {
      throw new Error(`Commission rate above 100%: ${raw}`);
    }
    return new CommissionRate(thousandths);
  }

  /** Commission on a whole-SAR price, in halalas, rounded half-up. */
  commissionHalalasFor(priceSar: number): number {
    const numerator = priceSar * HALALAS_PER_RIYAL * this.thousandths;
    return Math.floor((numerator + RATE_SCALE / 2) / RATE_SCALE);
  }

  /** The same value as a decimal SAR string for Decimal(10,2), e.g. "59.90". */
  commissionFor(priceSar: number): string {
    const halalas = this.commissionHalalasFor(priceSar);
    const riyals = Math.floor(halalas / HALALAS_PER_RIYAL);
    const rest = String(halalas % HALALAS_PER_RIYAL).padStart(2, '0');
    return `${riyals}.${rest}`;
  }
}
