import { CommissionRate } from './commission-rate';

describe('CommissionRate', () => {
  it('computes commission exactly, without floats', () => {
    expect(CommissionRate.parse('0.10').commissionFor(599)).toBe('59.90');
    expect(CommissionRate.parse('0.1').commissionFor(2499)).toBe('249.90');
    expect(CommissionRate.parse('0.080').commissionFor(2499)).toBe('199.92');
    // 0.1 + 0.2 style float traps: 0.07 × 1000 must be exactly 70.00.
    expect(CommissionRate.parse('0.07').commissionFor(1000)).toBe('70.00');
  });

  it('rounds half up to the halala', () => {
    // 0.125 × 1 SAR = 12.5 halalas → 13.
    expect(CommissionRate.parse('0.125').commissionHalalasFor(1)).toBe(13);
    expect(CommissionRate.parse('0.125').commissionFor(1)).toBe('0.13');
  });

  it('accepts 0 and 1, rejects anything else', () => {
    expect(CommissionRate.parse('0').commissionFor(500)).toBe('0.00');
    expect(CommissionRate.parse('1.000').commissionFor(5)).toBe('5.00');
    expect(() => CommissionRate.parse('1.5')).toThrow();
    expect(() => CommissionRate.parse('10%')).toThrow();
    expect(() => CommissionRate.parse('0.1234')).toThrow();
  });
});
