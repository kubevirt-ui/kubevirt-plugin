import { IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { FilterValue, RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { SortByDirection } from '@patternfly/react-table';

const status = {
  active: 'running',
  false: 'failed',
  true: 'succeeded',
  unknown: 'unknown',
};

const statusHandler = {
  get: (mapper: typeof status, prop: string) => {
    const value = mapper[prop];
    if (value) return value;
    return status.unknown;
  },
};

const statusMapper = new Proxy(status, statusHandler);

export const filters: RowFilter<IoK8sApiCoreV1ConfigMap>[] = [
  {
    filter: ({ selected }: FilterValue, obj: IoK8sApiCoreV1ConfigMap) => {
      const value = statusMapper[(obj?.data, obj?.data?.['status.succeeded'])];
      return selected?.length === 0 || selected?.includes(value);
    },
    filterGroupName: t('Status'),
    items: [
      { id: 'succeeded', title: t('Succeeded') },
      { id: 'failed', title: t('Failed') },
      { id: 'running', title: t('Running') },
      { id: 'unknown', title: t('Unknown') },
    ],
    reducer: (obj) => statusMapper[obj?.data?.['status.succeeded']],
    type: 'status',
  },
];

export const columnsSorting = (
  data: IoK8sApiCoreV1ConfigMap[],
  sortDirection: SortByDirection,
  field: string,
  isNumberCompare = false,
) => {
  const sortedArr = data.sort((a, b) => {
    const numbersCompare = a?.data?.[field] > b?.data?.[field] ? 1 : -1;
    const stringCompare = a?.data?.[field]?.localeCompare(b?.data?.[field]) ? 1 : -1;
    return isNumberCompare ? numbersCompare : stringCompare;
  });
  return sortDirection === 'asc' ? sortedArr.reverse() : sortedArr;
};
