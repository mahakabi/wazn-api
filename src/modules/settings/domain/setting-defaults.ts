import { SettingKey } from './setting-key';

/**
 * Fallback values used when a key is missing from the `settings` table, and the
 * values the seed writes. Stored as strings because that is how the table stores them;
 * `default_commission` is a decimal string so it never passes through a float.
 */
export const SETTING_DEFAULTS: Readonly<Record<SettingKey, string>> = {
  [SettingKey.DefaultCommission]: '0.10',
  [SettingKey.CodeValidityDays]: '7',
  [SettingKey.PriceFreshnessDays]: '30',
};
