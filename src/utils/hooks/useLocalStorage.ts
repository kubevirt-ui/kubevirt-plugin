import { useCallback, useEffect, useState } from 'react';

import { EVENT_LOCALSTORAGE } from './constants';
import { parseNestedJSON } from './useKubevirtUserSettings/utils/utils';

type UseLocalStorage = <T = string>(
  key: string,
  initialValue?: string,
) => [value: T, setLocalStorageValue: (newValue: T) => void, removeItem: () => void];

const event = new Event(EVENT_LOCALSTORAGE);
const useLocalStorage: UseLocalStorage = <T = string>(key, initialValue) => {
  const [value, setValue] = useState<T>(() => parseNestedJSON(localStorage.getItem(key)));

  const setLocalStorageValue = (val: T): void => {
    localStorage.setItem(key, JSON.stringify(val));
    document.dispatchEvent(event);
  };

  if (!value && initialValue) {
    setLocalStorageValue(initialValue);
  }

  const removeItem = (): void => {
    localStorage.removeItem(key);
    document.dispatchEvent(event);
  };

  const localStorageSetHandler = useCallback(() => {
    setValue(parseNestedJSON(localStorage.getItem(key)));
  }, [key]);

  useEffect(() => {
    document.addEventListener(EVENT_LOCALSTORAGE, localStorageSetHandler, false);
    return (): void => {
      document.removeEventListener(EVENT_LOCALSTORAGE, localStorageSetHandler, false);
    };
  }, [localStorageSetHandler]);

  return [value, setLocalStorageValue, removeItem];
};

export default useLocalStorage;
