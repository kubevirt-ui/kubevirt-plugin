import { RefObject, useEffect } from 'react';

const MOUSEDOWN = 'mousedown';

export const useClickOutside = <T extends HTMLElement>(
  ref: RefObject<T>,
  onClickOutside: () => void,
) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickOutside();
      }
    };

    document.addEventListener(MOUSEDOWN, handleClickOutside);

    return () => {
      document.removeEventListener(MOUSEDOWN, handleClickOutside);
    };
  }, [ref, onClickOutside]);
};
