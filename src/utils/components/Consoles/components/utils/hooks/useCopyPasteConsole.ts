import { useEffect, useRef } from 'react';

import { CONSOLE_PASTE_EVENT } from '@kubevirt-utils/components/Consoles/utils/constants';

const useCopyPasteConsole = () => {
  const pasteText = useRef<string>('');
  useEffect(() => {
    const pasteFn = (event: CustomEvent) => {
      pasteText.current = event.detail;
    };
    document.addEventListener(CONSOLE_PASTE_EVENT, pasteFn);
    return () => {
      document.removeEventListener(CONSOLE_PASTE_EVENT, pasteFn); // clean up
    };
  }, []);
  return pasteText;
};

export default useCopyPasteConsole;
