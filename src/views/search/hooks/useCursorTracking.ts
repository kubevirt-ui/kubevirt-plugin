import {
  FormEvent,
  RefObject,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { TokenParts } from '@search/searchLanguage/types';
import { splitAtCursorToken } from '@search/searchLanguage/utils';

export type SetDraftTextWithCursor = (value: string, cursorPos?: number) => void;

type UseCursorTrackingProps = {
  displayText: string;
  inputRef: RefObject<HTMLInputElement>;
  setDraftText: (value: string) => void;
};

type UseCursorTrackingResult = {
  handleCursorChange: (event: FormEvent<HTMLInputElement>) => void;
  setDraftTextWithCursor: SetDraftTextWithCursor;
  tokenParts: TokenParts;
  updateCursorPosition: () => void;
};

const useCursorTracking = ({
  displayText,
  inputRef,
  setDraftText,
}: UseCursorTrackingProps): UseCursorTrackingResult => {
  const pendingCursorRef = useRef<null | number>(null);
  const [cursorPosition, setCursorPosition] = useState(0);

  const tokenParts = useMemo(
    () => splitAtCursorToken(displayText, cursorPosition),
    [displayText, cursorPosition],
  );

  const setDraftTextWithCursor: SetDraftTextWithCursor = useCallback(
    (value, cursorPos) => {
      if (cursorPos !== undefined) {
        pendingCursorRef.current = cursorPos;
      }
      setDraftText(value);
    },
    [setDraftText],
  );

  useLayoutEffect(() => {
    if (pendingCursorRef.current !== null && inputRef.current) {
      const pos = pendingCursorRef.current;
      inputRef.current.setSelectionRange(pos, pos);
      setCursorPosition(pos);
      pendingCursorRef.current = null;
    }
  }, [displayText, inputRef]);

  const updateCursorPosition = useCallback(() => {
    if (inputRef.current) {
      setCursorPosition(inputRef.current.selectionStart ?? 0);
    }
  }, [inputRef]);

  const handleCursorChange = useCallback((event: FormEvent<HTMLInputElement>) => {
    setCursorPosition(event.currentTarget.selectionStart ?? 0);
  }, []);

  return {
    handleCursorChange,
    setDraftTextWithCursor,
    tokenParts,
    updateCursorPosition,
  };
};

export default useCursorTracking;
