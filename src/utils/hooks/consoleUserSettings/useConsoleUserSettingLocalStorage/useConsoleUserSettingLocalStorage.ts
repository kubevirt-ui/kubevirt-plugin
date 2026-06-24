import { useCallback, useEffect, useRef, useState } from 'react';

import { isConsoleUserSettingsLocalStorage } from '@kubevirt-utils/hooks/consoleUserSettings/utils';

import { ConsoleUserSettingHookResult } from '../types';
import useQueuedUserSettingWrite from '../useQueuedUserSettingWrite/useQueuedUserSettingWrite';

import { CONSOLE_USER_SETTINGS } from './consts';
import {
  parseStoredUserSettingValue,
  readConsoleUserSettingsLocalStorage,
  writeConsoleUserSettingsLocalStorage,
} from './utils';

type UseConsoleUserSettingLocalStorage = <T>(
  key: string,
  parser: (value: unknown) => T,
  emptyValue: T,
) => ConsoleUserSettingHookResult<T, (value: T) => Promise<T>>;

const useConsoleUserSettingLocalStorage: UseConsoleUserSettingLocalStorage = <T>(
  key: string,
  parser: (value: unknown) => T,
  emptyValue: T,
) => {
  const [error, setError] = useState<Error>();
  const [loaded, setLoaded] = useState(false);
  const [value, setValue] = useState<T>(emptyValue);
  const valueRef = useRef(value);
  const queuedWrite = useQueuedUserSettingWrite();

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const readValue = useCallback(() => {
    const settings = readConsoleUserSettingsLocalStorage();
    return parser(settings[key]);
  }, [key, parser]);

  useEffect(() => {
    if (!isConsoleUserSettingsLocalStorage()) {
      return;
    }

    setValue(readValue());
    setLoaded(true);

    const onStorage = (event: StorageEvent) => {
      if (
        event.storageArea !== localStorage ||
        event.key !== CONSOLE_USER_SETTINGS.LOCAL_STORAGE_KEY
      ) {
        return;
      }

      setValue(readValue());
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [readValue]);

  const updateValue = useCallback(
    async (newValue: T) => {
      setError(undefined);
      const previousValue = valueRef.current;

      try {
        await queuedWrite(newValue, async (valueToWrite) => {
          const settings = readConsoleUserSettingsLocalStorage();
          writeConsoleUserSettingsLocalStorage({
            ...settings,
            [key]: parseStoredUserSettingValue(valueToWrite),
          });
          setValue(valueToWrite);
        });

        return newValue;
      } catch (apiError) {
        const apiErr = apiError as Error;
        setError(apiErr);
        setValue(previousValue);
        throw apiErr;
      }
    },
    [key, queuedWrite],
  );

  return [value, updateValue, loaded, error];
};

export default useConsoleUserSettingLocalStorage;
