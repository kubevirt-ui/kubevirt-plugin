import { Dispatch, SetStateAction, useEffect, useState } from 'react';

type UseToggle = (
  key: string,
  defaultValue?: boolean,
) => [isToggled: boolean, toggle: Dispatch<SetStateAction<boolean>>];

export const useToggle: UseToggle = (key = '', defaultValue) => {
  const [isToggled, setIsToggled] = useState<boolean>(() => {
    // Retrieve initial value from localStorage (if available)
    const storedValue = localStorage.getItem(key);
    const parsedValue = storedValue && JSON.parse(storedValue);
    return defaultValue !== undefined ? defaultValue : parsedValue ?? false;
  });

  // Update localStorage on toggle change
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(isToggled));
  }, [isToggled, key]);

  const toggle = (): void => {
    setIsToggled((prev) => !prev);
  };

  return [isToggled, toggle];
};
