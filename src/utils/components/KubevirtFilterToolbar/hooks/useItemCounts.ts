import { useMemo } from 'react';

import { KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

const useItemCounts = (
  filters: KubevirtFilter[],
  data?: K8sResourceCommon[],
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
