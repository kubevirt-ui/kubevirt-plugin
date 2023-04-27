import { useState } from 'react';

import { DEFAULT_PREFERENCE_LABEL } from '@catalog/CreateFromInstanceTypes/utils/constants';
import { BootableVolume } from '@catalog/CreateFromInstanceTypes/utils/types';
import { getBootableVolumePVCSource } from '@catalog/CreateFromInstanceTypes/utils/utils';
import {
  V1alpha1PersistentVolumeClaim,
  V1alpha2VirtualMachineClusterPreference,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getName } from '@kubevirt-utils/resources/shared';
import { DESCRIPTION_ANNOTATION } from '@kubevirt-utils/resources/vm';
import { ThSortType } from '@patternfly/react-table/dist/esm/components/Table/base';

import { PaginationState } from '../utils/constants';

type UseBootVolumeSortColumns = (
  unsortedData: BootableVolume[],
  preferences: {
    [resourceKeyName: string]: V1alpha2VirtualMachineClusterPreference;
  },
  pvcSources: {
    [resourceKeyName: string]: V1alpha1PersistentVolumeClaim;
  },
  pagination: PaginationState,
) => {
  sortedData: BootableVolume[];
  getSortType: (columnIndex: number) => ThSortType;
};

const useBootVolumeSortColumns: UseBootVolumeSortColumns = (
  unsortedData,
  preferences,
  pvcSources,
  pagination,
) => {
  const [activeSortIndex, setActiveSortIndex] = useState<number | null>(null);
  const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc' | null>(null);

  const getSortableRowValues = (bootableVolume: BootableVolume): string[] => {
    const pvcSource = getBootableVolumePVCSource(bootableVolume, pvcSources);
    const { labels, annotations, namespace } = bootableVolume?.metadata || {};

    return [
      getName(bootableVolume),
      namespace,
      getName(preferences[labels?.[DEFAULT_PREFERENCE_LABEL]]),
      pvcSource?.spec?.storageClassName,
      pvcSource?.spec?.resources?.requests?.storage,
      annotations?.[DESCRIPTION_ANNOTATION],
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
    sortBy: {
      defaultDirection: 'asc',
      direction: activeSortDirection,
      index: activeSortIndex,
    },
    onSort: (_event, index, direction) => {
      setActiveSortIndex(index);
      setActiveSortDirection(direction);
    },
    columnIndex,
  });

  const sortedData = (unsortedData || [])
    ?.sort(sortVolumes)
    ?.slice(pagination.startIndex, pagination.endIndex);

  return { sortedData, getSortType };
};

export default useBootVolumeSortColumns;
