import { useMemo, useState } from 'react';

import { type V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { type IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  type V1beta1VirtualMachineClusterPreference,
  type V1beta1VirtualMachinePreference,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type VolumeSnapshotKind } from '@kubevirt-utils/components/SelectSnapshot/types';
import { type PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import { type BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import {
  type ClusterNamespacedResourceMap,
  type NamespacedResourceMap,
  type ResourceMap,
} from '@kubevirt-utils/resources/shared';
import { type ThSortType } from '@patternfly/react-table/dist/esm/components/Table/base/types';
import {
  type BootableVolumeSortCriterion,
  sortBootableVolumesWithColumnGetters,
} from '@virtualmachines/wizard/components/BootableVolumeList/utils/getSortedBootableVolumes';

type UseBootVolumeSortColumns = (
  unsortedData: BootableVolume[],
  clusterPreferencesMap: ResourceMap<V1beta1VirtualMachineClusterPreference>,
  userPreferencesMap: NamespacedResourceMap<V1beta1VirtualMachinePreference>,
  pvcSources: ClusterNamespacedResourceMap<IoK8sApiCoreV1PersistentVolumeClaim>,
  volumeSnapshotSources: {
    [datSourceName: string]: VolumeSnapshotKind;
  },
  pagination: PaginationState,
  includeNamespaceColumn: boolean,
  dvSources: ClusterNamespacedResourceMap<V1beta1DataVolume>,
) => {
  getSortType: (columnIndex: number) => ThSortType;
  sortedData: BootableVolume[];
  sortedPaginatedData: BootableVolume[];
};

const useBootVolumeSortColumns: UseBootVolumeSortColumns = (
  unsortedData = [],
  clusterPreferencesMap,
  userPreferencesMap,
  pvcSources,
  volumeSnapshotSources,
  pagination,
  includeNamespaceColumn,
  dvSources,
) => {
  const [sortCriteria, setSortCriteria] = useState<BootableVolumeSortCriterion>({
    columnIndex: 0,
    direction: 'asc',
  });

  const sortedData = useMemo(
    () =>
      sortBootableVolumesWithColumnGetters(unsortedData, sortCriteria, {
        clusterPreferencesMap,
        dvSources,
        includeNamespaceColumn,
        pvcSources,
        userPreferencesMap,
        volumeSnapshotSources,
      }),
    [
      clusterPreferencesMap,
      dvSources,
      includeNamespaceColumn,
      pvcSources,
      sortCriteria,
      unsortedData,
      userPreferencesMap,
      volumeSnapshotSources,
    ],
  );

  const sortedPaginatedData = sortedData.slice(pagination.startIndex, pagination.endIndex);

  const getSortType = (columnIndex: number): ThSortType => ({
    columnIndex,
    onSort: (_event, index, direction): void => {
      setSortCriteria({ columnIndex: index, direction });
    },
    sortBy: {
      defaultDirection: 'asc',
      direction: sortCriteria.direction,
      index: sortCriteria.columnIndex,
    },
  });

  return { getSortType, sortedData, sortedPaginatedData };
};

export default useBootVolumeSortColumns;
