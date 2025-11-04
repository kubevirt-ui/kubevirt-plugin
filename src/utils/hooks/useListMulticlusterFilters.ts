import { useMemo } from 'react';
import { isEmpty } from 'lodash';

import { AdvancedSearchFilter } from '@stolostron/multicluster-sdk';

import useListClusters from './useListClusters';
import useListNamespaces from './useListNamespaces';

const useListMulticlusterFilters = (
  additionalFilters?: AdvancedSearchFilter,
): AdvancedSearchFilter => {
  const clusters = useListClusters();
  const namespaces = useListNamespaces();

  return useMemo(
    () => [
      ...(isEmpty(clusters) ? [] : [{ property: 'cluster', values: clusters }]),
      ...(isEmpty(namespaces) ? [] : [{ property: 'namespace', values: namespaces }]),
      ...(additionalFilters || []),
    ],
    [clusters, namespaces, additionalFilters],
  );
};

export default useListMulticlusterFilters;
