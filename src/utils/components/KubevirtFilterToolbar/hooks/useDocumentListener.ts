import {
  type Dispatch,
  type RefObject,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';

import { type KeyEventMap, KeyEventModes, textInputKeyHandler } from '../constants';

/**
 * Use this hook for components that require visibility only
 * when the user is actively interacting with the document.
 */

type UseDocumentListenerReturn<T extends HTMLElement> = {
  ref: RefObject<T | null>;
  setVisible: Dispatch<SetStateAction<boolean>>;
  visible: boolean;
};

export const useDocumentListener = <T extends HTMLElement>(
  keyEventMap: KeyEventMap = textInputKeyHandler,
): UseDocumentListenerReturn<T> => {
  const [visible, setVisible] = useState(true);
  const ref = useRef<T>(null);

  const handleEvent = (e: MouseEvent): void => {
    if (!ref?.current?.contains(e.target as Node)) {
      setVisible(false);
    }
  };

  const handleKeyEvents = (e: KeyboardEvent): void => {
    const target = e.target;
    const nodeName = target instanceof Element ? target.nodeName : '';
    switch (keyEventMap[e.key]) {
      case KeyEventModes.HIDE:
        setVisible(false);
        ref.current?.blur();
        break;
      case KeyEventModes.FOCUS:
        if (
          document.activeElement !== ref.current &&
          // Don't steal focus if the user types the focus shortcut in another text input.
          nodeName !== 'INPUT' &&
          nodeName !== 'TEXTAREA'
        ) {
          ref.current?.focus();
          e.preventDefault();
        }
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleEvent, true);
    document.addEventListener('keydown', handleKeyEvents, true);
    return (): void => {
      document.removeEventListener('click', handleEvent, true);
      document.removeEventListener('keydown', handleKeyEvents, true);
    };
  });

  return { ref, setVisible, visible };
};
