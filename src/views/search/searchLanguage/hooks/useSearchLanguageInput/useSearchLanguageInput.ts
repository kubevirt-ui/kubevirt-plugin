import { FormEvent, KeyboardEvent, useCallback, useState } from 'react';

export type UseSearchLanguageInputProps = {
  commitToken: (tokenText: string) => void;
  inputValue: string;
  setInputValue: (value: string) => void;
};

export type UseSearchLanguageInputResult = {
  isDropdownOpen: boolean;
  onChange: (event: FormEvent<HTMLInputElement>, value: string) => void;
  onClear: () => void;
  onCloseDropdown: () => void;
  onInputFocus: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
};

export const useSearchLanguageInput = ({
  commitToken,
  inputValue,
  setInputValue,
}: UseSearchLanguageInputProps): UseSearchLanguageInputResult => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const onCloseDropdown = useCallback(() => {
    setIsDropdownOpen(false);
  }, []);

  const onInputFocus = useCallback(() => {
    setIsDropdownOpen(true);
  }, []);

  const onChange = useCallback(
    (_event: FormEvent<HTMLInputElement>, value: string) => {
      if (value.endsWith(' ') && value.trim()) {
        commitToken(value);
        setInputValue('');
        setIsDropdownOpen(false);
      } else {
        setInputValue(value);
      }
    },
    [commitToken, setInputValue],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
        return;
      }
      if (event.key === 'Enter' && inputValue.trim()) {
        event.preventDefault();
        commitToken(inputValue);
        setInputValue('');
        setIsDropdownOpen(false);
      }
    },
    [commitToken, inputValue, setInputValue],
  );

  const onClear = useCallback(() => {
    setInputValue('');
  }, [setInputValue]);

  return {
    isDropdownOpen,
    onChange,
    onClear,
    onCloseDropdown,
    onInputFocus,
    onKeyDown,
  };
};
