import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  OnFilterChange,
  RowFilter,
  useListPageFilter,
} from '@openshift-console/dynamic-plugin-sdk';

import { getCheckupsSelfValidationListFilters } from '../../utils';

type UseCheckupsSelfValidationFilters = (
  data: IoK8sApiCoreV1ConfigMap[],
) => [
  unfilteredData: IoK8sApiCoreV1ConfigMap[],
  filteredData: IoK8sApiCoreV1ConfigMap[],
  onFilterChange: OnFilterChange,
  filters: RowFilter<IoK8sApiCoreV1ConfigMap>[],
];

const useCheckupsSelfValidationListFilters: UseCheckupsSelfValidationFilters = (data) => {
  const { t } = useKubevirtTranslation();

  const filters = getCheckupsSelfValidationListFilters(t);

  const [unfilteredData, filteredData, onFilterChange] = useListPageFilter<
    IoK8sApiCoreV1ConfigMap,
    IoK8sApiCoreV1ConfigMap
  >(data, filters);

  return [unfilteredData, filteredData, onFilterChange, filters];
};

export default useCheckupsSelfValidationListFilters;
