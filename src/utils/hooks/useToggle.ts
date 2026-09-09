import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';

type UseToggle = (
  key: string,
  defaultValue?: boolean,
) => [isToggled: boolean, toggle: Dispatch<SetStateAction<boolean>>];

export const useToggle: UseToggle = (key = '', defaultValue) => {
  const [isToggled, setIsToggled] = useState<boolean>(() => {
    // Retrieve initial value from localStorage (if available)
    const storedValue = localStorage.getItem(key);
    if (storedValue === null) {
      return defaultValue ?? false;
    }
    const parsedValue = JSON.parse(storedValue) as boolean;
    return typeof parsedValue === 'boolean' ? parsedValue : (defaultValue ?? false);
  });

  // Update localStorage on toggle change
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(isToggled));
  }, [isToggled, key]);

  return [isToggled, setIsToggled];
};
