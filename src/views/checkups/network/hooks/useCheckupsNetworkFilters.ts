import { useMemo } from 'react';

import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { useClusterFilter } from '@kubevirt-utils/hooks/useClusterFilter';
import { useProjectFilter } from '@kubevirt-utils/hooks/useProjectFilter';
import useIsACMPage from '@multicluster/useIsACMPage';
import {
  OnFilterChange,
  RowFilter,
  useListPageFilter,
} from '@openshift-console/dynamic-plugin-sdk';

import { filters } from '../utils/filters';

type UseCheckupsNetworkFilters = (
  data: IoK8sApiCoreV1ConfigMap[],
) => [
  unfilteredData: IoK8sApiCoreV1ConfigMap[],
  dataFilter: IoK8sApiCoreV1ConfigMap[],
  onFilterChange: OnFilterChange,
  filters: RowFilter<IoK8sApiCoreV1ConfigMap>[],
  filtersWithSelect: RowFilter<IoK8sApiCoreV1ConfigMap>[],
];

const useCheckupsNetworkFilters: UseCheckupsNetworkFilters = (data) => {
  const isACMPage = useIsACMPage();
  const clusterFilter = useClusterFilter();
  const projectFilter = useProjectFilter();

  const filtersWithSelect = useMemo(
    () => (isACMPage ? [clusterFilter, projectFilter] : []),
    [clusterFilter, projectFilter, isACMPage],
  );

  const allFilters = useMemo(() => {
    return [...filtersWithSelect, ...filters];
  }, [filtersWithSelect]);

  const [unfilterData, dataFilters, onFilterChange] = useListPageFilter<
    IoK8sApiCoreV1ConfigMap,
    IoK8sApiCoreV1ConfigMap
  >(data, allFilters);

  return [unfilterData, dataFilters, onFilterChange, filters, filtersWithSelect];
};

export default useCheckupsNetworkFilters;
