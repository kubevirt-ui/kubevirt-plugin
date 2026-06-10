import { FormEvent, KeyboardEvent, useCallback } from 'react';

import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { KeyTypes } from '@patternfly/react-core';
import { AutocompleteMode, DropdownType } from '@search/components/SearchDropdown/types';

import { buildValidatedToken } from './utils';

export type UseSearchLanguageInputProps = {
  autocompleteMode: AutocompleteMode;
  commitToken: (tokenText: string) => void;
  filterDefinitions: KubevirtFilter[];
  inputValue: string;
  onArrowKey?: (event: KeyboardEvent<HTMLInputElement>) => boolean;
  onCloseDropdown: () => void;
  onOpenDropdown: () => void;
  onSelectHighlighted?: () => boolean;
  setInputValue: (value: string) => void;
};

export type UseSearchLanguageInputResult = {
  onChange: (event: FormEvent<HTMLInputElement>, value: string) => void;
  onClear: () => void;
  onInputFocus: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
};

export const useSearchLanguageInput = ({
  autocompleteMode,
  commitToken,
  filterDefinitions,
  inputValue,
  onArrowKey,
  onCloseDropdown,
  onOpenDropdown,
  onSelectHighlighted,
  setInputValue,
}: UseSearchLanguageInputProps): UseSearchLanguageInputResult => {
  const tryCommit = useCallback(
    (value: string) => {
      const trimmed = value.trim().replace(/,+$/, '');
      if (!trimmed) return;

      if (autocompleteMode.type === DropdownType.VALUES) {
        const validated = buildValidatedToken(
          trimmed,
          autocompleteMode.filterType,
          filterDefinitions,
        );
        if (!validated) return;
        commitToken(validated);
      } else {
        commitToken(trimmed);
      }

      setInputValue('');
      onCloseDropdown();
    },
    [autocompleteMode, commitToken, filterDefinitions, setInputValue, onCloseDropdown],
  );

  const onChange = useCallback(
    (_event: FormEvent<HTMLInputElement>, value: string) => {
      if (value.endsWith(KeyTypes.Space) && value.trim()) {
        tryCommit(value);
      } else {
        setInputValue(value);
        onOpenDropdown();
      }
    },
    [tryCommit, setInputValue, onOpenDropdown],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === KeyTypes.Escape) {
        onCloseDropdown();
        return;
      }

      if (event.key === KeyTypes.ArrowDown || event.key === KeyTypes.ArrowUp) {
        if (onArrowKey?.(event)) return;
      }

      if (event.key === KeyTypes.Enter || event.key === KeyTypes.Tab) {
        if (onSelectHighlighted?.()) {
          event.preventDefault();
          return;
        }

        if (event.key === KeyTypes.Enter && inputValue.trim()) {
          event.preventDefault();
          tryCommit(inputValue);
        }
      }
    },
    [inputValue, onArrowKey, onCloseDropdown, onSelectHighlighted, tryCommit],
  );

  const onClear = useCallback(() => {
    setInputValue('');
  }, [setInputValue]);

  const onInputFocus = useCallback(() => {
    onOpenDropdown();
  }, [onOpenDropdown]);

  return {
    onChange,
    onClear,
    onInputFocus,
    onKeyDown,
  };
};
