import { useState } from 'react';

import { DEFAULT_PREFERENCE_LABEL } from '@catalog/CreateFromInstanceTypes/utils/constants';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1beta1VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import { getBootableVolumePVCSource } from '@kubevirt-utils/resources/bootableresources/helpers';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { getName } from '@kubevirt-utils/resources/shared';
import { DESCRIPTION_ANNOTATION } from '@kubevirt-utils/resources/vm';
import { ThSortType } from '@patternfly/react-table/dist/esm/components/Table/base';

type UseBootVolumeSortColumns = (
  unsortedData: BootableVolume[],
  preferences: {
    [resourceKeyName: string]: V1beta1VirtualMachineClusterPreference;
  },
  pvcSources: {
    [resourceKeyName: string]: IoK8sApiCoreV1PersistentVolumeClaim;
  },
  pagination: PaginationState,
) => {
  getSortType: (columnIndex: number) => ThSortType;
  sortedData: BootableVolume[];
};

const useBootVolumeSortColumns: UseBootVolumeSortColumns = (
  unsortedData = [],
  preferences,
  pvcSources,
  pagination,
) => {
  const [activeSortIndex, setActiveSortIndex] = useState<null | number>(null);
  const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc' | null>(null);

  const getSortableRowValues = (bootableVolume: BootableVolume): string[] => {
    const pvcSource = getBootableVolumePVCSource(bootableVolume, pvcSources);

    return [
      getName(bootableVolume),
      getName(preferences[bootableVolume?.metadata?.labels?.[DEFAULT_PREFERENCE_LABEL]]),
      pvcSource?.spec?.storageClassName,
      pvcSource?.spec?.resources?.requests?.storage,
      bootableVolume?.metadata?.annotations?.[DESCRIPTION_ANNOTATION],
    ];
  };

  const sortVolumes = (a: BootableVolume, b: BootableVolume): number => {
    const aValue = getSortableRowValues(a)[activeSortIndex];
    const bValue = getSortableRowValues(b)[activeSortIndex];

    if (activeSortDirection === 'asc') {
      return aValue?.localeCompare(bValue);
    }
    return bValue?.localeCompare(aValue);
  };

  const getSortType = (columnIndex: number): ThSortType => ({
    columnIndex,
    onSort: (_event, index, direction) => {
      setActiveSortIndex(index);
      setActiveSortDirection(direction);
    },
    sortBy: {
      defaultDirection: 'asc',
      direction: activeSortDirection,
      index: activeSortIndex,
    },
  });

  const sortedData = unsortedData
    .sort(sortVolumes)
    .slice(pagination.startIndex, pagination.endIndex);
  return { getSortType, sortedData };
};

export default useBootVolumeSortColumns;
