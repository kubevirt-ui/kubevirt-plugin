/* eslint-disable */
import { UserSettingsState } from './userSettingsInitialState';

export type UserSettingFavorites = [
  string[],
  (val: any) => Promise<{
    [key: string]: string;
  }>,
];

export type KubevirtUserSetting = [
  value: { [key: string]: any },
  updater: (val: any) => Promise<{ [key: string]: any }>,
  loaded: boolean,
  error: Error,
];

export type UseKubevirtUserSettings = (
  key?: keyof UserSettingsState,
  cluster?: string,
) => KubevirtUserSetting;
