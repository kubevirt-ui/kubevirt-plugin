import React from 'react';

import { EVENT_LOCALSTORAGE } from './constants';

type UseLocalStorage = (
  key: string,
  initialValue?: string,
) => [value: string, setLocalStorageValue: (newValue: any) => void, removeItem: () => void];

const event = new Event(EVENT_LOCALSTORAGE);
const useLocalStorage: UseLocalStorage = (key, initialValue) => {
  const [value, setValue] = React.useState(localStorage.getItem(key));

  const setLocalStorageValue = (val: any) => {
    localStorage.setItem(key, val.toString());
    document.dispatchEvent(event);
  };

  if (!value && initialValue) {
    setLocalStorageValue(initialValue);
  }

  const removeItem = () => {
    localStorage.removeItem(key);
    document.dispatchEvent(event);
  };

  const localStorageSetHandler = React.useCallback(() => {
    setValue(localStorage.getItem(key));
  }, [key]);
  React.useEffect(() => {
    document.addEventListener(EVENT_LOCALSTORAGE, localStorageSetHandler, false);
    return () => {
      document.removeEventListener(EVENT_LOCALSTORAGE, localStorageSetHandler, false);
    };
  }, [localStorageSetHandler]);

  return [value, setLocalStorageValue, removeItem];
};

export default useLocalStorage;
