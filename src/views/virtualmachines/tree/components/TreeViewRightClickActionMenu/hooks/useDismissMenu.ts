import { useCallback, useEffect } from 'react';

import { CLICK, ESCAPE, KEYDOWN } from '@kubevirt-utils/hooks/useClickOutside/constants';

const useDismissMenu = (hideMenu: () => void, isOpen: boolean): void => {
  const handleClick = useCallback(
    (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest('.right-click-action-menu')) return;
      hideMenu();
    },
    [hideMenu],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === ESCAPE) hideMenu();
    },
    [hideMenu],
  );

  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener(CLICK, handleClick, true);
    document.addEventListener(KEYDOWN, handleKeyDown, true);

    return () => {
      document.removeEventListener(CLICK, handleClick, true);
      document.removeEventListener(KEYDOWN, handleKeyDown, true);
    };
  }, [isOpen, handleClick, handleKeyDown]);
};

export default useDismissMenu;
