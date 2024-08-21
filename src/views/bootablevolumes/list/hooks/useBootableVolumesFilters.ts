import { PersistentVolumeClaimModel } from '@kubevirt-ui/kubevirt-api/console';
import DataSourceModel from '@kubevirt-ui/kubevirt-api/console/models/DataSourceModel';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { ISO } from '@kubevirt-utils/resources/bootableresources/constants';
import { isBootableVolumeISO } from '@kubevirt-utils/resources/bootableresources/helpers';
import { OS_NAMES } from '@kubevirt-utils/resources/template';
import { getItemNameWithOther, includeFilter } from '@kubevirt-utils/utils/utils';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

import { BootableResource } from '../../utils/types';
import { getPreferenceOSType } from '../../utils/utils';

const useBootableVolumesFilters = (): RowFilter<BootableResource>[] => {
  const { t } = useKubevirtTranslation();

  return [
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
