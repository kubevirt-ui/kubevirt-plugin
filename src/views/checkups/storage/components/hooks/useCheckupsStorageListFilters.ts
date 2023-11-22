import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { FilterValue, RowFilter, useListPageFilter } from '@openshift-console/dynamic-plugin-sdk';

import { filters } from '../../utils/filters';

type UseCheckupsStorageFilters = (
  data: IoK8sApiCoreV1ConfigMap[],
) => [
  unfilteredData: IoK8sApiCoreV1ConfigMap[],
  dataFilter: IoK8sApiCoreV1ConfigMap[],
  onFilterChange: (type: string, value: FilterValue) => void,
  filters: RowFilter<IoK8sApiCoreV1ConfigMap>[],
];

const useCheckupsStorageListFilters: UseCheckupsStorageFilters = (data) => {
  const [unfilterData, dataFilters, onFilterChange] = useListPageFilter<
    IoK8sApiCoreV1ConfigMap,
    IoK8sApiCoreV1ConfigMap
  >(data, filters);

  return [unfilterData, dataFilters, onFilterChange, filters];
};

export default useCheckupsStorageListFilters;
