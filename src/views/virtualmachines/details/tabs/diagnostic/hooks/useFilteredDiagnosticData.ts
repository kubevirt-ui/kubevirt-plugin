import { useMemo } from 'react';

import { DiagnosticCategory } from '../utils/constants';
import {
  type DiagnosticData,
  type DiagnosticFilters,
  type VirtualizationDataVolumeStatus,
  type VirtualizationStatusCondition,
  type VirtualizationVolumeSnapshotStatus,
} from '../utils/types';
import { filterBySearchText, matchesFilters } from '../utils/utils';

type FilteredDiagnosticData = {
  filteredConditions: VirtualizationStatusCondition[];
  filteredDataVolumes: VirtualizationDataVolumeStatus[];
  filteredVolumeSnapshots: VirtualizationVolumeSnapshotStatus[];
};

const useFilteredDiagnosticData = (
  { conditions, dataVolumesStatuses, volumeSnapshotStatuses }: DiagnosticData,
  filters: DiagnosticFilters,
  searchText: string,
): FilteredDiagnosticData =>
  useMemo(
    () => ({
      filteredConditions: conditions
        .filter((condition) =>
          matchesFilters(filters, DiagnosticCategory.VirtualMachines, condition.severity),
        )
        .filter((condition) =>
          filterBySearchText(searchText, condition.reason, condition.message, condition.type),
        ),
      filteredDataVolumes: dataVolumesStatuses
        .filter((dvStatus) =>
          matchesFilters(filters, DiagnosticCategory.Storage, dvStatus.severity),
        )
        .filter((dvStatus) =>
          filterBySearchText(searchText, dvStatus.name, dvStatus.phase, dvStatus.message),
        ),
      filteredVolumeSnapshots: volumeSnapshotStatuses
        .filter((vss) => matchesFilters(filters, DiagnosticCategory.Storage, vss.severity))
        .filter((vss) => filterBySearchText(searchText, vss.name, vss.reason, vss.message)),
    }),
    [conditions, dataVolumesStatuses, volumeSnapshotStatuses, filters, searchText],
  );

export default useFilteredDiagnosticData;
