import { type AppSettings } from './app-settings';
import { SETTING_DEFAULTS } from './setting-defaults';
import { SettingKey } from './setting-key';

const RATE_SHAPE = /^0(\.\d{1,3})?$|^1(\.0{1,3})?$/;

function positiveInt(raw: string | undefined, fallback: string): number {
  const value = Number(raw ?? fallback);
  return Number.isInteger(value) && value > 0 ? value : Number(fallback);
}

/** Turns raw key/value rows into typed settings; bad or missing values fall back to defaults. */
export function parseAppSettings(rows: ReadonlyMap<string, string>): AppSettings {
  const rate = rows.get(SettingKey.DefaultCommission)?.trim();
  return {
    defaultCommissionRate:
      rate !== undefined && RATE_SHAPE.test(rate)
        ? rate
        : SETTING_DEFAULTS[SettingKey.DefaultCommission],
    codeValidityDays: positiveInt(
      rows.get(SettingKey.CodeValidityDays),
      SETTING_DEFAULTS[SettingKey.CodeValidityDays],
    ),
    priceFreshnessDays: positiveInt(
      rows.get(SettingKey.PriceFreshnessDays),
      SETTING_DEFAULTS[SettingKey.PriceFreshnessDays],
    ),
  };
}
