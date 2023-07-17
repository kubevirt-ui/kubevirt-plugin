import { useEffect, useMemo, useState } from 'react';

import { debounce } from '@kubevirt-utils/utils/debounce';
import useQuery from '@virtualmachines/details/tabs/metrics/NetworkCharts/hook/useQuery';

import useDeepCompareMemoize from '../useDeepCompareMemoize/useDeepCompareMemoize';

type UseKubevirtDataPodFilters = (filters: { [key: string]: string }) => any;

const useKubevirtDataPodFilters: UseKubevirtDataPodFilters = (filters) => {
  const [queryString, setQueryString] = useState<string>('');
  const query = useQuery();
  const filtersCompared = useDeepCompareMemoize(filters, true);
  const updateQueryString = useMemo(
    () =>
      debounce(
        (url) =>
          setQueryString((prevQuery) =>
            prevQuery !== url?.toString() ? url?.toString() : prevQuery,
          ),
        700,
      ),
    [],
  );
  useEffect(() => {
    const url = new URLSearchParams();
    for (const [key, value] of query.entries()) {
      const valueReplaced = value === 'No InstanceType' || value === 'None' ? null : value;
      filtersCompared?.[key] && url.set(filtersCompared?.[key], valueReplaced);
    }
    updateQueryString(url);
  }, [filtersCompared, query, updateQueryString]);

  return queryString;
};

export default useKubevirtDataPodFilters;
