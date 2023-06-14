import { useEffect, useState } from 'react';

import useQuery from '@virtualmachines/details/tabs/metrics/NetworkCharts/hook/useQuery';

import useDeepCompareMemoize from '../useDeepCompareMemoize/useDeepCompareMemoize';

type UseKubevirtDataPodFilters = (filters: { [key: string]: string }) => any;

const useKubevirtDataPodFilters: UseKubevirtDataPodFilters = (filters) => {
  const [queryString, setQueryString] = useState<string>('');
  const query = useQuery();
  const filtersCompared = useDeepCompareMemoize(filters, true);
  useEffect(() => {
    const url = new URLSearchParams();
    for (const [key, value] of query.entries()) {
      filtersCompared?.[key] && url.set(filtersCompared?.[key], value);
    }
    setQueryString((prevQuery) => {
      return prevQuery !== url?.toString() ? url?.toString() : prevQuery;
    });
  }, [filtersCompared, query]);

  return queryString;
};

export default useKubevirtDataPodFilters;
