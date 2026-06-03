import { KubevirtFilterState } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';

export const getOnSelect =
  (
    filters: KubevirtFilterState,
    onSetFilters: (newFilters: Partial<KubevirtFilterState>) => void,
  ) =>
  (filterId: string, value: string) => {
    const selected = filters[filterId] ?? [];
    const newValues = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onSetFilters({ [filterId]: newValues });
  };
