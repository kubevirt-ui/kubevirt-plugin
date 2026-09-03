import { logVMSavedSearchApplied } from '@kubevirt-utils/extensions/telemetry/dashboard';
import {
  type KubevirtFilterState,
  type OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { updateFilterState } from '@search/searchLanguage/hooks/useOnCommitText/updateFilterState';
import { convertQueryToFilterState } from '@search/utils/query';

import { type SavedSearchEntry } from './types';

export const applySearch = (
  name: string,
  searches: SavedSearchEntry[],
  filters: KubevirtFilterState,
  onSetFilters: OnSetFilters,
): void => {
  const entry = searches.find((search) => search.name === name);
  const query = entry?.query;

  if (query) {
    const newFilters = convertQueryToFilterState(query);
    updateFilterState(filters, newFilters, onSetFilters);
    logVMSavedSearchApplied(query);
  }
};
