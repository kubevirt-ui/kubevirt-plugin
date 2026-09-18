import { kubevirtConsole } from './utils';

export const getSessionStorageItem = (key: string): string | null => {
  try {
    return sessionStorage.getItem(key);
  } catch (error) {
    kubevirtConsole.warn('Failed to read from session storage', error);
    return null;
  }
};

export const setSessionStorageItem = (key: string, value: string): void => {
  try {
    sessionStorage.setItem(key, value);
  } catch (error) {
    kubevirtConsole.warn('Failed to write to session storage', error);
  }
};
