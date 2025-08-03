import { useMemo } from 'react';

import { PersistentVolumeClaimModel } from '@kubevirt-ui/kubevirt-api/console';
import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import useHcoWorkloadArchitectures from '@kubevirt-utils/hooks/useHcoWorkloadArchitectures';
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
import { getName } from '@kubevirt-utils/resources/shared';
import { OS_NAMES } from '@kubevirt-utils/resources/template';
import {
  ARCHITECTURE_ID,
  ARCHITECTURE_TITLE,
  getArchitecture,
} from '@kubevirt-utils/utils/architecture';
import { getItemNameWithOther, includeFilter } from '@kubevirt-utils/utils/utils';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

import { BootableResource } from '../../utils/types';
import { getPreferenceOSType } from '../../utils/utils';

const useBootableVolumesFilters = (): RowFilter<BootableResource>[] => {
  const { t } = useKubevirtTranslation();
  const workloadsArchitectures = useHcoWorkloadArchitectures();
  const workloadsArchitecturesItems = useMemo(
    () =>
      workloadsArchitectures.map((arch) => ({
        id: arch,
        title: arch,
      })),
    [workloadsArchitectures],
  );

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
      filter: (availableArchitectures, obj) =>
        includeFilter(availableArchitectures, workloadsArchitecturesItems, getArchitecture(obj)),
      filterGroupName: ARCHITECTURE_TITLE,
      items: workloadsArchitecturesItems,
      reducer: (obj) => getItemNameWithOther(getArchitecture(obj), workloadsArchitecturesItems),
      type: ARCHITECTURE_ID,
    },
    {
      filter: (availableOsNames, obj) =>
        includeFilter(availableOsNames, OS_NAMES, getPreferenceOSType(obj)),
      filterGroupName: t('Operating system'),
      items: OS_NAMES,
      reducer: (obj) => getItemNameWithOther(getPreferenceOSType(obj), OS_NAMES),
      type: 'osName',
    },
    {
      filter: (availableResourceNames, obj) =>
        availableResourceNames?.selected?.length === 0 ||
        availableResourceNames?.selected?.includes(obj?.kind),
      filterGroupName: t('Resource'),
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
      reducer: (obj) => obj?.kind,
      type: `resourceKind`,
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

export default useBootableVolumesFilters;
