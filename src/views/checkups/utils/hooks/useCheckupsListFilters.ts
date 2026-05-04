import { useMemo } from 'react';
import { TFunction } from 'i18next';

import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  OnFilterChange,
  RowFilter,
  useListPageFilter,
} from '@openshift-console/dynamic-plugin-sdk';

type UseCheckupsListFilters = (
  data: IoK8sApiCoreV1ConfigMap[],
  getFiltersImpl: (t: TFunction) => RowFilter<IoK8sApiCoreV1ConfigMap>[],
) => [
  unfilteredData: IoK8sApiCoreV1ConfigMap[],
  filteredData: IoK8sApiCoreV1ConfigMap[],
  onFilterChange: OnFilterChange,
  filters: RowFilter<IoK8sApiCoreV1ConfigMap>[],
];

const useCheckupsListFilters: UseCheckupsListFilters = (data, getFiltersImpl) => {
  const { t } = useKubevirtTranslation();

  const filters = useMemo(() => getFiltersImpl(t), [t, getFiltersImpl]);

  const [unfilteredData, filteredData, onFilterChange] = useListPageFilter<
    IoK8sApiCoreV1ConfigMap,
    IoK8sApiCoreV1ConfigMap
  >(data, filters);

  return [unfilteredData, filteredData, onFilterChange, filters];
};

export default useCheckupsListFilters;
