import { useEffect, useState } from 'react';

import { debounce } from '@kubevirt-utils/utils/debounce';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useQuery from '@virtualmachines/details/tabs/metrics/NetworkCharts/hook/useQuery';

import useDeepCompareMemoize from '../useDeepCompareMemoize/useDeepCompareMemoize';

type UseKubevirtDataPodFilters = (filters: { [key: string]: string }) => any;

const updateQueryString = (setQueryString) =>
  debounce((url) => setQueryString((prevQuery) => (prevQuery !== url ? url : prevQuery)), 700);

const useKubevirtDataPodFilters: UseKubevirtDataPodFilters = (filters) => {
  const [queryString, setQueryString] = useState<string>('');
  const query = useQuery();
  const filtersCompared = useDeepCompareMemoize(filters);

  useEffect(() => {
    const url = new URLSearchParams();
    for (const [key, value] of query.entries()) {
      const valueReplaced = value === 'No InstanceType' || value === 'None' ? null : value;
      filtersCompared?.[key] && url.set(filtersCompared?.[key], valueReplaced);
    }
    const urlString = url.toString();

    (!isEmpty(urlString) || !isEmpty(queryString)) && updateQueryString(setQueryString)(urlString);
  }, [filtersCompared, query, queryString]);

  return queryString;
};

export default useKubevirtDataPodFilters;
