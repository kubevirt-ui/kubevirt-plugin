import { CONSOLE_USER_SETTINGS } from './consts';

type ConsoleUserSettingsLocalStorage = Record<string, unknown>;

export const readConsoleUserSettingsLocalStorage = (): ConsoleUserSettingsLocalStorage => {
  const rawValue = localStorage.getItem(CONSOLE_USER_SETTINGS.LOCAL_STORAGE_KEY);

  if (!rawValue) {
    return {};
  }

  try {
    return (JSON.parse(rawValue) as ConsoleUserSettingsLocalStorage) || {};
  } catch {
    return {};
  }
};

export const writeConsoleUserSettingsLocalStorage = (
  settings: ConsoleUserSettingsLocalStorage,
): void => {
  const serializedValue = JSON.stringify(settings);
  const previousValue = localStorage.getItem(CONSOLE_USER_SETTINGS.LOCAL_STORAGE_KEY);

  localStorage.setItem(CONSOLE_USER_SETTINGS.LOCAL_STORAGE_KEY, serializedValue);

  window.dispatchEvent(
    new StorageEvent('storage', {
      key: CONSOLE_USER_SETTINGS.LOCAL_STORAGE_KEY,
      newValue: serializedValue,
      oldValue: previousValue,
      storageArea: localStorage,
      url: window.location.toString(),
    }),
  );
};

export const parseStoredUserSettingValue = <T>(value: T): T => value;

export const parseBooleanUserPreference = (value: string | undefined): boolean => {
  if (!value) {
    return false;
  }

  try {
    return JSON.parse(value) === true;
  } catch {
    return value === 'true';
  }
};

export const serializeBooleanUserPreference = (value: boolean): string => JSON.stringify(value);

export const parseStoredBooleanUserPreference = (value: unknown): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    return parseBooleanUserPreference(value);
  }

  return false;
};
