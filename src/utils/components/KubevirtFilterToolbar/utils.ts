import { type KubevirtFilterState } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';

export const getOnSelect =
  (
    filters: KubevirtFilterState,
    onSetFilters: (newFilters: Partial<KubevirtFilterState>) => void,
  ): ((filterId: string, value: string) => void) =>
  (filterId: string, value: string): void => {
    const selected = filters[filterId] ?? [];
    const newValues = selected.includes(value)
      ? selected.filter((val) => val !== value)
      : [...selected, value];
    onSetFilters({ [filterId]: newValues });
  };
