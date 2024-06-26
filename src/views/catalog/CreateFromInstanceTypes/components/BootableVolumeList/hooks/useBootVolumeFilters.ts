import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { OS_NAMES } from '@kubevirt-utils/resources/template';
import { getItemNameWithOther } from '@kubevirt-utils/utils/utils';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

import { getBootVolumeOS } from '../utils/utils';

const useBootVolumeFilters = (isModal: boolean): RowFilter<BootableVolume>[] => {
  const { t } = useKubevirtTranslation();

  return [
    {
      filter: (availableOsNames, obj) =>
        availableOsNames?.selected?.length === 0 ||
        availableOsNames?.selected?.includes(getItemNameWithOther(getBootVolumeOS(obj), OS_NAMES)),
      filterGroupName: t('Operating system'),
      items: OS_NAMES,
      reducer: (obj) => getItemNameWithOther(getBootVolumeOS(obj), OS_NAMES),
      type: `osName${isModal && '-modal'}`,
    },
    {
      filter: (availableResourceNames, obj) =>
        availableResourceNames?.selected?.length === 0 ||
        availableResourceNames?.selected?.includes(obj?.kind),
      filterGroupName: t('Resource'),
      items: [
        {
          id: DataSourceModel.kind,
          title: 'DS',
        },
      ],
      reducer: (obj) => obj?.kind,
      type: `resourceKind${isModal && '-modal'}`,
    },
  ];
};
export default useBootVolumeFilters;
