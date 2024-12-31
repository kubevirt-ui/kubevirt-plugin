import { MutableRefObject, useEffect } from 'react';

import { CLICK, ESCAPE, KEYDOWN, TAB } from './constants';

export const useClickOutside = (
  refs: MutableRefObject<HTMLElement | null>[],
  onClickOutside: () => void,
) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (refs?.every((ref) => ref?.current && !ref?.current.contains(event.target as Node))) {
        onClickOutside();
      }
    };

    const handleMenuKeys = (event: KeyboardEvent) => {
      if (event?.key === ESCAPE) {
        onClickOutside();
      } else if (event.key === TAB) {
        // Check if the focus is outside all provided refs
        if (refs.every((ref) => ref.current && !ref.current.contains(event.target as Node))) {
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
  }, [refs, onClickOutside]);
};
