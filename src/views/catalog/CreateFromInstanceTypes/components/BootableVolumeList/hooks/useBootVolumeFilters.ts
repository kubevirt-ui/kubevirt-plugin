import { BootableVolume } from '@catalog/CreateFromInstanceTypes/utils/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { OS_NAMES } from '@kubevirt-utils/resources/template';
import { getItemNameWithOther } from '@kubevirt-utils/utils/utils';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

import { getBootVolumeOS } from '../utils/utils';

const useBootVolumeFilters = (type?: string): RowFilter<BootableVolume>[] => {
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
