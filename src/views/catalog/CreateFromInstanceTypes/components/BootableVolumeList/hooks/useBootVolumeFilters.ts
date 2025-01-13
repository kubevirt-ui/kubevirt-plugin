import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ISO,
  SHOW_DEPRECATED_BOOTABLE_VOLUMES,
  SHOW_DEPRECATED_BOOTABLE_VOLUMES_LABEL,
} from '@kubevirt-utils/resources/bootableresources/constants';
import {
  isBootableVolumeISO,
  isDeprecated,
} from '@kubevirt-utils/resources/bootableresources/helpers';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { getName } from '@kubevirt-utils/resources/shared';
import { OS_NAMES } from '@kubevirt-utils/resources/template';
import { getItemNameWithOther } from '@kubevirt-utils/utils/utils';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

import { getBootVolumeOS } from '../utils/utils';

const useBootVolumeFilters = (isModal: boolean): RowFilter<BootableVolume>[] => {
  const { t } = useKubevirtTranslation();

  return [
    {
      filter: (availableResourceNames, obj) =>
        availableResourceNames?.selected?.length === 0 ? !isDeprecated(getName(obj)) : true,
      filterGroupName: ' ',
      items: [
        {
          id: t('Show deprecated bootable volumes'),
          title: t('Show deprecated bootable volumes'),
        },
      ],
      reducer: (obj) => isDeprecated(getName(obj)) && SHOW_DEPRECATED_BOOTABLE_VOLUMES_LABEL,
      type: SHOW_DEPRECATED_BOOTABLE_VOLUMES,
    },
    {
      filter: (availableOsNames, obj) => {
        return (
          availableOsNames?.selected?.length === 0 ||
          availableOsNames?.selected?.includes(getItemNameWithOther(getBootVolumeOS(obj), OS_NAMES))
        );
      },
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
    {
      filter: (filters, obj) => filters?.selected?.length === 0 || isBootableVolumeISO(obj),
      filterGroupName: t('Type'),
      items: [
        {
          id: ISO,
          title: ISO,
        },
      ],
      reducer: (obj) => isBootableVolumeISO(obj) && ISO,
      type: ISO,
    },
  ];
};
export default useBootVolumeFilters;
