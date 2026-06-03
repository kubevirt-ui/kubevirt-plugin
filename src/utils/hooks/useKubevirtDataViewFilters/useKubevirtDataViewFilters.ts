import { useMemo } from 'react';
import { useSearchParams } from 'react-router';

import {
  fuzzyCaseInsensitive,
  getLabelsAsString,
} from '@kubevirt-utils/components/ListPageFilter/utils';
import { getName } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { useDataViewFilters } from '@patternfly/react-data-view';

import { KubevirtFilter, KubevirtFilterState } from './types';

type UseKubevirtDataViewFiltersArgs = {
  data: K8sResourceCommon[];
  filters: KubevirtFilter[];
};

const useKubevirtDataViewFilters = ({
  data,
  filters: filterDefinitions,
}: UseKubevirtDataViewFiltersArgs) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialFilters = useMemo<KubevirtFilterState>(
    () =>
      filterDefinitions.reduce<KubevirtFilterState>(
        (acc, filter) => {
          acc[filter.id] = filter.defaultSelected ?? [];
          return acc;
        },
        { labels: [], name: [] },
      ),
    [filterDefinitions],
  );

  const { clearAllFilters, filters, onSetFilters } = useDataViewFilters<KubevirtFilterState>({
    initialFilters,
    searchParams,
    setSearchParams,
  });

  const filteredData = useMemo(
    () =>
      data?.filter((obj) => {
        const nameFilter = filters.name[0] ?? '';
        const matchesName = !nameFilter || fuzzyCaseInsensitive(nameFilter, getName(obj) ?? '');

        const objectLabels = getLabelsAsString(obj);
        const matchesLabels =
          isEmpty(filters.labels) || filters.labels.every((label) => objectLabels.includes(label));

        return (
          matchesName &&
          matchesLabels &&
          filterDefinitions.every((filterDef) => {
            const selected = filters[filterDef.id];
            if (filterDef.applyWhenEmpty) return filterDef.match(obj, selected);
            return isEmpty(selected) || filterDef.match(obj, selected);
          })
        );
      }) ?? [],
    [data, filters, filterDefinitions],
  );

  return { clearAllFilters, filteredData, filters, onSetFilters };
};

export default useKubevirtDataViewFilters;
