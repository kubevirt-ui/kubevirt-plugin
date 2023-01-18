import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { OS_NAMES } from '@kubevirt-utils/resources/template';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

import { getBootVolumeOS, getItemNameWithOther } from '../utils/utils';

const useBootVolumeFilters = (type?: string): RowFilter<V1beta1DataSource>[] => {
  const { t } = useKubevirtTranslation();

  return [
    {
      filterGroupName: t('Operating system'),
      type,
      reducer: (obj) => getItemNameWithOther(getBootVolumeOS(obj), OS_NAMES),
      filter: (availableOsNames, obj) =>
        availableOsNames?.selected?.length === 0 ||
        availableOsNames?.selected?.includes(getItemNameWithOther(getBootVolumeOS(obj), OS_NAMES)),
      items: OS_NAMES,
    },
  ];
};

export default useBootVolumeFilters;
