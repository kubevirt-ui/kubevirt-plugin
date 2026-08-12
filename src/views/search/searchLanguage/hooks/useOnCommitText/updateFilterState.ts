import {
  type KubevirtFilterState,
  type OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { isEmpty } from '@kubevirt-utils/utils/utils';

export const updateFilterState = (
  currentFilters: KubevirtFilterState,
  newFilters: Partial<KubevirtFilterState>,
  onSetFilters: OnSetFilters,
): void => {
  const update: Partial<KubevirtFilterState> = {};
  let hasChanges = false;

  for (const key of Object.keys(currentFilters)) {
    if (!(key in newFilters) && !isEmpty(currentFilters[key])) {
      update[key] = [];
      hasChanges = true;
    }
  }

  for (const [key, values] of Object.entries(newFilters)) {
    const currentSet = new Set(currentFilters[key] ?? []);
    const isEqual = currentSet.size === values.length && values.every((val) => currentSet.has(val));
    if (!isEqual) {
      update[key] = values;
      hasChanges = true;
    }
  }

  if (hasChanges) {
    onSetFilters({ ...newFilters, ...update });
  }
};
