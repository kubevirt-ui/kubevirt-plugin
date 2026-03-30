import { useMemo } from 'react';

import { DataSourceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
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
import {
  ARCHITECTURE_ID,
  ARCHITECTURE_TITLE,
  getArchitecture,
  getUniqueArchitectures,
} from '@kubevirt-utils/utils/architecture';
import { OTHER } from '@kubevirt-utils/utils/constants';
import { getItemNameWithOther, includeFilter, isEmpty } from '@kubevirt-utils/utils/utils';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

import { getBootVolumeOS } from '../utils/utils';

const useBootVolumeFilters = (
  bootableVolumes: BootableVolume[],
  isModal: boolean,
): RowFilter<BootableVolume>[] => {
  const { t } = useKubevirtTranslation();

  const workloadsArchitecturesItems = useMemo(
    () =>
      getUniqueArchitectures(bootableVolumes).map((arch) => ({
        id: arch ?? OTHER,
        title: arch ?? t(OTHER),
      })),
    [bootableVolumes, t],
  );

  return useMemo(
    () => [
      {
        filter: (availableResourceNames, obj) =>
          isEmpty(availableResourceNames?.selected?.length) ? !isDeprecated(getName(obj)) : true,
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
        filter: (availableArchitectures, obj) =>
          includeFilter(availableArchitectures, workloadsArchitecturesItems, getArchitecture(obj)),
        filterGroupName: ARCHITECTURE_TITLE,
        items: workloadsArchitecturesItems,
        reducer: (obj) => getItemNameWithOther(getArchitecture(obj), workloadsArchitecturesItems),
        type: ARCHITECTURE_ID,
      },
      {
        filter: (availableOsNames, obj) => {
          return (
            isEmpty(availableOsNames?.selected?.length) ||
            availableOsNames?.selected?.includes(
              getItemNameWithOther(getBootVolumeOS(obj), OS_NAMES),
            )
          );
        },
        filterGroupName: t('Operating system'),
        items: OS_NAMES,
        reducer: (obj) => getItemNameWithOther(getBootVolumeOS(obj), OS_NAMES),
        type: `osName${isModal && '-modal'}`,
      },
      {
        filter: (availableResourceNames, obj) =>
          isEmpty(availableResourceNames?.selected?.length) ||
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
        filter: (filters, obj) => isEmpty(filters?.selected?.length) || isBootableVolumeISO(obj),
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
    ],
    [workloadsArchitecturesItems, t, isModal],
  );
};
export default useBootVolumeFilters;
