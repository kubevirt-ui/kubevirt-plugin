import { useEffect, useState } from 'react';

import useQuery from '@kubevirt-utils/hooks/useQuery';
import { useDebounceCallback } from '@overview/utils/hooks/useDebounceCallback';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils/constants';

import { NameFilterProps } from '../components/NameFilter';

type UseNameFilter = (applyFilters: (type: string, value?: string) => void) => NameFilterProps;

const useNameFilter: UseNameFilter = (applyFilters) => {
  const queryParams = useQuery();
  const nameQuery = queryParams.get(VirtualMachineRowFilterType.Name);

  const [inputText, setInputText] = useState(nameQuery || '');

  useEffect(() => {
    setInputText(nameQuery || '');
  }, [nameQuery]);

  const applyFiltersWithDebounce = useDebounceCallback(applyFilters, 250);

  const onDelete = () => {
    setInputText('');
    applyFilters(VirtualMachineRowFilterType.Name);
  };

  const onTextChange = (_, newInput: string) => {
    setInputText(newInput);
    applyFiltersWithDebounce(VirtualMachineRowFilterType.Name, newInput);
  };

  return {
    inputText,
    onDelete,
    onTextChange,
  };
};

export default useNameFilter;
