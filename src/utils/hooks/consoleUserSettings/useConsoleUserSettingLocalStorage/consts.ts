export const CONSOLE_USER_SETTINGS = {
  LOCAL_STORAGE_KEY: 'console-user-settings',
  LOCATION: {
    CONFIGMAP: 'configmap',
    LOCALSTORAGE: 'localstorage',
  },
} as const;

export type ConsoleUserSettingsLocation =
  (typeof CONSOLE_USER_SETTINGS.LOCATION)[keyof typeof CONSOLE_USER_SETTINGS.LOCATION];
