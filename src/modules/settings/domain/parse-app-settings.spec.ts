import { parseAppSettings } from './parse-app-settings';

describe('parseAppSettings', () => {
  it('uses stored values', () => {
    const rows = new Map([
      ['default_commission', '0.085'],
      ['code_validity_days', '10'],
      ['price_freshness_days', '14'],
    ]);

    expect(parseAppSettings(rows)).toEqual({
      defaultCommissionRate: '0.085',
      codeValidityDays: 10,
      priceFreshnessDays: 14,
    });
  });

  it('falls back to defaults for missing or malformed values', () => {
    const rows = new Map([
      ['default_commission', '10%'],
      ['code_validity_days', '-3'],
    ]);

    expect(parseAppSettings(rows)).toEqual({
      defaultCommissionRate: '0.10',
      codeValidityDays: 7,
      priceFreshnessDays: 30,
    });
  });
});
