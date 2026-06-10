import { useCallback } from 'react';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  AutocompleteMode,
  DropdownType,
  SearchKeyBadge,
} from '@search/components/SearchDropdown/types';
import { EXCLUSION_PREFIX } from '@search/searchLanguage/constants';

type UseSearchLanguageDropdownProps = {
  autocompleteMode: AutocompleteMode;
  commitToken: (tokenText: string) => void;
  inputValue: string;
  onCloseDropdown: () => void;
  setInputValue: (value: string) => void;
};

type UseSearchLanguageDropdownResult = {
  onSelectExample: (query: string) => void;
  onSelectKey: (badge: SearchKeyBadge) => void;
  onSelectRecentSearch: (token: string) => void;
  onSelectValue: (value: string) => void;
};

export const useSearchLanguageDropdown = ({
  autocompleteMode,
  commitToken,
  inputValue,
  onCloseDropdown,
  setInputValue,
}: UseSearchLanguageDropdownProps): UseSearchLanguageDropdownResult => {
  const onSelectKey = useCallback(
    (badge: SearchKeyBadge) => {
      const keyText = badge.usesColon === false ? badge.searchKey : `${badge.searchKey}:`;
      setInputValue(keyText);
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

  const onSelectValue = useCallback(
    (value: string) => {
      if (autocompleteMode.type !== DropdownType.VALUES) return;

      const { searchKey, selectedValues } = autocompleteMode;

      const lowerValue = value.toLowerCase();
      const isAlreadySelected = selectedValues.some((v) => v.toLowerCase() === lowerValue);

      let newValues: string[];
      if (isAlreadySelected) {
        newValues = selectedValues.filter((v) => v.toLowerCase() !== lowerValue);
      } else {
        newValues = [...selectedValues, value];
      }

      const prefix = inputValue.startsWith(EXCLUSION_PREFIX) ? EXCLUSION_PREFIX : '';
      const newInput = `${prefix}${searchKey}:${newValues.join(',')}${
        isEmpty(newValues) ? '' : ','
      }`;
      setInputValue(newInput);
    },
    [autocompleteMode, inputValue, setInputValue],
  );

  return {
    onSelectExample,
    onSelectKey,
    onSelectRecentSearch,
    onSelectValue,
  };
};
