import { useEffect, useState } from 'react';

import {
  KubevirtFilterState,
  OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useDebounceCallback } from '@overview/utils/hooks/useDebounceCallback';

import { NameFilterProps } from '../components/NameFilter';

const useNameFilter = (
  filters: KubevirtFilterState,
  onSetFilters: OnSetFilters,
): NameFilterProps => {
  const nameFromFilters = filters.name?.[0] ?? '';
  const [inputText, setInputText] = useState(nameFromFilters);

  useEffect(() => {
    setInputText(nameFromFilters);
  }, [nameFromFilters]);

  const debouncedSetFilters = useDebounceCallback(onSetFilters, 250);

  const onDelete = () => {
    setInputText('');
    onSetFilters({ name: [] });
  };

  const onTextChange = (_, newInput: string) => {
    setInputText(newInput);
    const trimmed = newInput.trim();
    debouncedSetFilters({ name: trimmed ? [trimmed] : [] });
  };

  return {
    inputText,
    onDelete,
    onTextChange,
    resetInputText: () => setInputText(''),
  };
};

export default useNameFilter;
