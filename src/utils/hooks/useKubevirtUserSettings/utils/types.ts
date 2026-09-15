import { type UserSettingsState } from './userSettingsInitialState';

export type UserSettingFavorites = [
  string[],
  (val: string[]) => Promise<{
    [key: string]: string;
  }>,
];

export type KubevirtUserSetting = [
  value: { [key: string]: unknown },
  updater: (val: unknown) => Promise<{ [key: string]: unknown }>,
  loaded: boolean,
  error: Error,
];

export type UseKubevirtUserSettings = (
  key?: keyof UserSettingsState,
  cluster?: string,
) => KubevirtUserSetting;
