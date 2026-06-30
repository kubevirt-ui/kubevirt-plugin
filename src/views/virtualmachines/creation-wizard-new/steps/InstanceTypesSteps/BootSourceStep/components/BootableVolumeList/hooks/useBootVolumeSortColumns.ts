import { useMemo, useState } from 'react';

import { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  V1beta1VirtualMachineClusterPreference,
  V1beta1VirtualMachinePreference,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { VolumeSnapshotKind } from '@kubevirt-utils/components/SelectSnapshot/types';
import { PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import {
  ClusterNamespacedResourceMap,
  NamespacedResourceMap,
  ResourceMap,
} from '@kubevirt-utils/resources/shared';
import { ThSortType } from '@patternfly/react-table/dist/esm/components/Table/base/types';
import {
  BootableVolumeSortCriterion,
  sortBootableVolumesWithColumnGetters,
} from '@virtualmachines/creation-wizard-new/steps/InstanceTypesSteps/BootSourceStep/components/BootableVolumeList/utils/getSortedBootableVolumes';

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
    onSort: (_event, index, direction) => {
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
