import { useCallback, useMemo, useState } from 'react';

import { V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  V1beta1VirtualMachineClusterPreference,
  V1beta1VirtualMachinePreference,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { VolumeSnapshotKind } from '@kubevirt-utils/components/SelectSnapshot/types';
import { PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import {
  getBootableVolumePVCSource,
  getDataVolumeForPVC,
} from '@kubevirt-utils/resources/bootableresources/helpers';
import { getVolumeSnapshotStorageClass } from '@kubevirt-utils/resources/bootableresources/selectors';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import {
  ClusterNamespacedResourceMap,
  getName,
  getNamespace,
  NamespacedResourceMap,
  ResourceMap,
} from '@kubevirt-utils/resources/shared';
import { DESCRIPTION_ANNOTATION } from '@kubevirt-utils/resources/vm';
import { getArchitecture } from '@kubevirt-utils/utils/architecture';
import { ThSortType } from '@patternfly/react-table/dist/esm/components/Table/base/types';
import { getOSFromDefaultPreference } from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/BootSourceStep/components/BootableVolumeList/utils/utils';
import { getDiskSize } from '@virtualmachines/creation-wizard/utils/utils';

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
  const [activeSortIndex, setActiveSortIndex] = useState<null | number>(0);
  const [activeSortDirection, setActiveSortDirection] = useState<'asc' | 'desc' | null>('asc');

  const getSortableRowValues = useCallback(
    (bootableVolume: BootableVolume): string[] => {
      const pvcSource = getBootableVolumePVCSource(bootableVolume, pvcSources);
      const dvSource = getDataVolumeForPVC(pvcSource, dvSources);
      const volumeSnapshotSource = volumeSnapshotSources?.[bootableVolume?.metadata?.name];

      return [
        getName(bootableVolume),
        getArchitecture(bootableVolume),
        ...(includeNamespaceColumn ? [getNamespace(bootableVolume)] : []),
        getOSFromDefaultPreference(bootableVolume, clusterPreferencesMap, userPreferencesMap),
        pvcSource?.spec?.storageClassName || getVolumeSnapshotStorageClass(volumeSnapshotSource),
        getDiskSize(dvSource, pvcSource, volumeSnapshotSource),
        bootableVolume?.metadata?.annotations?.[DESCRIPTION_ANNOTATION],
      ];
    },
    [
      clusterPreferencesMap,
      dvSources,
      includeNamespaceColumn,
      pvcSources,
      userPreferencesMap,
      volumeSnapshotSources,
    ],
  );

  const sortedData = useMemo(() => {
    const sortVolumes = (a: BootableVolume, b: BootableVolume): number => {
      const aValue = getSortableRowValues(a)[activeSortIndex];
      const bValue = getSortableRowValues(b)[activeSortIndex];

      if (activeSortDirection === 'asc') {
        return aValue?.localeCompare(bValue, undefined, { numeric: true, sensitivity: 'base' });
      }
      return bValue?.localeCompare(aValue, undefined, { numeric: true, sensitivity: 'base' });
    };

    return unsortedData?.sort(sortVolumes);
  }, [activeSortDirection, activeSortIndex, getSortableRowValues, unsortedData]);

  const sortedPaginatedData = useMemo(
    () => sortedData.slice(pagination.startIndex, pagination.endIndex),
    [pagination.endIndex, pagination.startIndex, sortedData],
  );

  const getSortType = useCallback(
    (columnIndex: number): ThSortType => ({
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
    }),
    [activeSortDirection, activeSortIndex],
  );

  return { getSortType, sortedData, sortedPaginatedData };
};

export default useBootVolumeSortColumns;
