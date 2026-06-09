import { useCallback } from 'react';

type UseSearchLanguageDropdownProps = {
  commitToken: (tokenText: string) => void;
  onCloseDropdown: () => void;
  setInputValue: (value: string) => void;
};

type UseSearchLanguageDropdownResult = {
  onSelectExample: (query: string) => void;
  onSelectKey: (key: string) => void;
  onSelectRecentSearch: (token: string) => void;
};

export const useSearchLanguageDropdown = ({
  commitToken,
  onCloseDropdown,
  setInputValue,
}: UseSearchLanguageDropdownProps): UseSearchLanguageDropdownResult => {
  const onSelectKey = useCallback(
    (key: string) => {
      setInputValue(key);
    },
    [setInputValue],
  );

  const onSelectRecentSearch = useCallback(
    (token: string) => {
      commitToken(token);
      setInputValue('');
      onCloseDropdown();
    },
    [commitToken, setInputValue, onCloseDropdown],
  );

  const onSelectExample = useCallback(
    (query: string) => {
      const tokens = query.split(/\s+/).filter(Boolean);
      tokens.forEach((token) => commitToken(token));
      setInputValue('');
      onCloseDropdown();
    },
    [commitToken, setInputValue, onCloseDropdown],
  );

  return {
    onSelectExample,
    onSelectKey,
    onSelectRecentSearch,
  };
};
