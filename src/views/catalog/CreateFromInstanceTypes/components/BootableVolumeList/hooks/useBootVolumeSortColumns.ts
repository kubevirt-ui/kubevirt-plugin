import { useState } from 'react';

import { DEFAULT_PREFERENCE_LABEL } from '@catalog/CreateFromInstanceTypes/utils/constants';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1alpha2VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getName } from '@kubevirt-utils/resources/shared';
import { DESCRIPTION_ANNOTATION } from '@kubevirt-utils/resources/vm';
import { ThSortType } from '@patternfly/react-table/dist/esm/components/Table/base';

import { PaginationState } from '../utils/constants';

type UseBootVolumeSortColumns = (
  unsortedData: V1beta1DataSource[],
  preferences: {
    [resourceKeyName: string]: V1alpha2VirtualMachineClusterPreference;
  },
  pagination: PaginationState,
) => {
  sortedData: V1beta1DataSource[];
  getSortType: (columnIndex: number) => ThSortType;
};

const useBootVolumeSortColumns: UseBootVolumeSortColumns = (
  unsortedData,
  preferences,
  pagination,
) => {
  const [activeSortIndex, setActiveSortIndex] = useState<number | null>(null);
  const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc' | null>(null);

  const getSortableRowValues = (bootableVolume: V1beta1DataSource): string[] => {
    return [
      getName(bootableVolume),
      getName(preferences[bootableVolume?.metadata?.labels?.[DEFAULT_PREFERENCE_LABEL]]),
      bootableVolume?.metadata?.annotations?.[DESCRIPTION_ANNOTATION],
    ];
  };

  const sortVolumes = (a: V1beta1DataSource, b: V1beta1DataSource): number => {
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
    ?.slice(pagination.startIndex, pagination.endIndex)
    ?.sort(sortVolumes);

  return { sortedData, getSortType };
};

export default useBootVolumeSortColumns;
