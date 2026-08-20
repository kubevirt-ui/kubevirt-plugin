import { useMemo } from 'react';

import useQuery from '@kubevirt-utils/hooks/useQuery';

import useDeepCompareMemoize from '../useDeepCompareMemoize/useDeepCompareMemoize';
import { type KubevirtDataPodFilters } from './types';
import { buildProxyFilterQuery } from './utils/buildProxyFilterQuery';

const useKubevirtDataPodFilters = (filters: KubevirtDataPodFilters): string => {
  const query = useQuery();
  const filtersMemoized = useDeepCompareMemoize(filters);

  return useMemo(() => buildProxyFilterQuery(query, filtersMemoized), [query, filtersMemoized]);
};

export default useKubevirtDataPodFilters;
