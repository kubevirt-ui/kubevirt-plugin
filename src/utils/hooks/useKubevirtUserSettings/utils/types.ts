export type TopConsumersData = { [key: string]: any };

export type SetTopConsumerData = <T>(field: string, value: T) => void;

export type UseKubevirtUserSettingsTopConsumerCards = () => [TopConsumersData, SetTopConsumerData];

export type UserSettingFavorites = [
  string[],
  (val: any) => Promise<{
    [key: string]: string;
  }>,
];

export type KubevirtUserSetting = [
  value: { [key: string]: any },
  updater: (val: any) => Promise<{ [key: string]: any }>,
  loading: boolean,
  error: Error,
];

export type UseKubevirtUserSettings = (key?: string) => KubevirtUserSetting;
