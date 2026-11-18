import { type AppSettings } from './app-settings';

export interface SettingsReader {
  get(): Promise<AppSettings>;
}

export const SETTINGS_READER = Symbol('SETTINGS_READER');
