import { KubevirtFilterState } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';

export const setFilter = (
  filterState: Partial<KubevirtFilterState>,
  tokenOrder: string[],
  key: string,
  value: string,
) => {
  filterState[key] = [value];
  if (!tokenOrder.includes(key)) tokenOrder.push(key);
};
