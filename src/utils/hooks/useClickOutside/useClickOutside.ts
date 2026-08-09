import { type MutableRefObject, useEffect } from 'react';

import { CLICK, ESCAPE, KEYDOWN, TAB } from './constants';

export const useClickOutside = (
  refs: MutableRefObject<HTMLElement | null>[],
  onClickOutside: () => void,
): void => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (refs?.every((ref) => ref?.current && !ref?.current.contains(event.target as Node))) {
        onClickOutside();
      }
    };

    const handleMenuKeys = (event: KeyboardEvent): void => {
      if (
        event?.key === ESCAPE ||
        (event.key === TAB &&
          refs.every((ref) => ref.current && !ref.current.contains(event.target as Node)))
      ) {
        onClickOutside();
      }
    };

    window?.addEventListener(KEYDOWN, handleMenuKeys);
    document.addEventListener(CLICK, handleClickOutside);

    return (): void => {
      window?.removeEventListener(KEYDOWN, handleMenuKeys);
      document.removeEventListener(CLICK, handleClickOutside);
    };
  }, [refs, onClickOutside]);
};
