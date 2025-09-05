import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import useQuery from '@kubevirt-utils/hooks/useQuery';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import useDeepCompareMemoize from '../useDeepCompareMemoize/useDeepCompareMemoize';

import { YAML_PATH_DELIMITER } from './utils/constants';

export type KubevirtDataPodFilters = { [key: string]: readonly string[] | string | string[] };

const updateQueryString = (setQueryString: Dispatch<SetStateAction<string>>) => (url: string) =>
  setQueryString((prevQuery) => (prevQuery !== url ? url : prevQuery));

const useKubevirtDataPodFilters = (filters: KubevirtDataPodFilters) => {
  const [queryString, setQueryString] = useState<string>('');
  const query = useQuery();
  const filtersMemoized = useDeepCompareMemoize(filters);

  useEffect(() => {
    const url = new URLSearchParams();
    for (const [key, value] of query.entries()) {
      const valueReplaced = value === 'No InstanceType' || value === 'None' ? null : value;

      if (key === 'rowFilter-status' && value === 'Error') {
        continue;
      }

      const yamlPath = filtersMemoized?.[key];
      if (yamlPath) {
        url.set(
          Array.isArray(yamlPath) ? yamlPath.join(YAML_PATH_DELIMITER) : (yamlPath as string),
          valueReplaced,
        );
      }
    }
    const urlString = url.toString();

    (!isEmpty(urlString) || !isEmpty(queryString)) && updateQueryString(setQueryString)(urlString);
  }, [filtersMemoized, query, queryString]);

  return queryString;
};

export default useKubevirtDataPodFilters;
