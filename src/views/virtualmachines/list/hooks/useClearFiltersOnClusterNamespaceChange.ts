import { useEffect, useRef } from 'react';

import { STATIC_SEARCH_FILTERS } from '@kubevirt-utils/components/ListPageFilter/constants';
import {
  KubevirtFilterState,
  OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { isFolderLabel } from '@kubevirt-utils/resources/shared';

type UseClearFiltersOnClusterNamespaceChangeProps = {
  cluster: string;
  filters: KubevirtFilterState;
  namespace: string;
  onSetFilters: OnSetFilters;
  resetPagination: () => void;
};

const useClearFiltersOnClusterNamespaceChange = ({
  cluster,
  filters,
  namespace,
  onSetFilters,
  resetPagination,
}: UseClearFiltersOnClusterNamespaceChangeProps) => {
  const prevContextRef = useRef({ cluster, namespace });

  useEffect(() => {
    const prevContext = prevContextRef.current;
    prevContextRef.current = { cluster, namespace };

    if (prevContext.namespace !== namespace || prevContext.cluster !== cluster) {
      const folderLabels = (filters[STATIC_SEARCH_FILTERS.labels] ?? []).filter(isFolderLabel);

      const clearedFilters = Object.keys(filters).reduce<Partial<KubevirtFilterState>>(
        (acc, key) => {
          acc[key] = key === STATIC_SEARCH_FILTERS.labels ? folderLabels : [];
          return acc;
        },
        {},
      );

      onSetFilters(clearedFilters);
      resetPagination();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [namespace, cluster, resetPagination]);
};

export default useClearFiltersOnClusterNamespaceChange;
