import { RefObject, useEffect } from 'react';

import { CLICK, ESCAPE, KEYDOWN, TAB } from './constants';

export const useClickOutside = <T extends HTMLElement>(
  ref: RefObject<T>,
  onClickOutside: () => void,
) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref?.current && !ref?.current.contains(event.target as Node)) {
        onClickOutside();
      }
    };

    const handleMenuKeys = (event) => {
      if (ref?.current) {
        if (event?.key === ESCAPE) {
          onClickOutside();
        }
        if (!ref?.current?.contains(event?.target) && event?.key === TAB) {
          onClickOutside();
        }
      }
    };

    window?.addEventListener(KEYDOWN, handleMenuKeys);
    document.addEventListener(CLICK, handleClickOutside);

    return () => {
      window?.removeEventListener(KEYDOWN, handleMenuKeys);
      document.removeEventListener(CLICK, handleClickOutside);
    };
  }, [ref, onClickOutside]);
};
