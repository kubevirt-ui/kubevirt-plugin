import { FormEvent, KeyboardEvent, useCallback, useState } from 'react';

import {
  KubevirtFilter,
  OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';

import useCommitToken from '../useCommitToken/useCommitToken';

type UseSearchLanguageInputResult = {
  inputValue: string;
  onChange: (event: FormEvent<HTMLInputElement>, value: string) => void;
  onClear: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
};

export const useSearchLanguageInput = (
  onSetFilters: OnSetFilters,
  filterDefinitions: KubevirtFilter[],
): UseSearchLanguageInputResult => {
  const [inputValue, setInputValue] = useState('');

  const commitToken = useCommitToken(onSetFilters, filterDefinitions);

  const onChange = useCallback(
    (_event: FormEvent<HTMLInputElement>, value: string) => {
      if (value.endsWith(' ') && value.trim()) {
        commitToken(value);
        setInputValue('');
      } else {
        setInputValue(value);
      }
    },
    [commitToken],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter' && inputValue.trim()) {
        event.preventDefault();
        commitToken(inputValue);
        setInputValue('');
      }
    },
    [commitToken, inputValue],
  );

  const onClear = useCallback(() => {
    setInputValue('');
  }, []);

  return { inputValue, onChange, onClear, onKeyDown };
};
