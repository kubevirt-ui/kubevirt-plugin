import { useCallback } from 'react';

import { KubevirtFilterState } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';

type UseOnSelectProps = {
  filters: KubevirtFilterState;
  onSetFilters: (newFilters: Partial<KubevirtFilterState>) => void;
};

const useOnSelect = ({ filters, onSetFilters }: UseOnSelectProps) => {
  const onSelect = useCallback(
    (filterId: string, value: string) => {
      const selected = filters[filterId] ?? [];
      const newValues = selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value];
      onSetFilters({ [filterId]: newValues });
    },
    [filters, onSetFilters],
  );

  return onSelect;
};

export default useOnSelect;
