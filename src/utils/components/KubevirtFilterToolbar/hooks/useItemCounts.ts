import { useMemo } from 'react';

import {
  FilterableObject,
  KubevirtFilter,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';

const useItemCounts = (
  filters: KubevirtFilter[],
  data?: FilterableObject[],
): Record<string, Record<string, number>> =>
  useMemo(() => {
    const counts: Record<string, Record<string, number>> = {};
    for (const filterDef of filters) {
      counts[filterDef.id] = {};
      for (const { value } of filterDef.options ?? []) {
        counts[filterDef.id][value] =
          data?.filter((obj) => filterDef.match(obj, [value])).length ?? 0;
      }
    }
    return counts;
  }, [filters, data]);

export default useItemCounts;
