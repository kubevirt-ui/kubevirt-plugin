import { BootableVolume } from '@catalog/CreateFromInstanceTypes/utils/types';
import { PersistentVolumeClaimModel } from '@kubevirt-ui/kubevirt-api/console';
import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { OS_NAMES } from '@kubevirt-utils/resources/template';
import { getItemNameWithOther } from '@kubevirt-utils/utils/utils';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

import { getBootVolumeOS } from '../utils/utils';

const useBootVolumeFilters = (isModal: boolean): RowFilter<BootableVolume>[] => {
  const { t } = useKubevirtTranslation();

  return [
    {
      filterGroupName: t('Operating system'),
      type: `osName${isModal && '-modal'}`,
      reducer: (obj) => getItemNameWithOther(getBootVolumeOS(obj), OS_NAMES),
      filter: (availableOsNames, obj) =>
        availableOsNames?.selected?.length === 0 ||
        availableOsNames?.selected?.includes(getItemNameWithOther(getBootVolumeOS(obj), OS_NAMES)),
      items: OS_NAMES,
    },
    {
      filterGroupName: t('Resource'),
      type: `resourceKind${isModal && '-modal'}`,
      reducer: (obj) => obj?.kind,
      filter: (availableResourceNames, obj) =>
        availableResourceNames?.selected?.length === 0 ||
        availableResourceNames?.selected?.includes(obj?.kind),
      items: [
        {
          id: PersistentVolumeClaimModel.kind,
          title: PersistentVolumeClaimModel.abbr,
        },
        {
          id: DataSourceModel.kind,
          title: 'DS',
        },
      ],
    },
  ];
};
export default useBootVolumeFilters;
