import { useMemo } from 'react';

import { DiagnosticCategory } from '../utils/constants';
import {
  DiagnosticData,
  DiagnosticFilters,
  VirtualizationDataVolumeStatus,
  VirtualizationStatusCondition,
  VirtualizationVolumeSnapshotStatus,
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
        .filter((c) => matchesFilters(filters, DiagnosticCategory.VirtualMachines, c.severity))
        .filter((c) => filterBySearchText(searchText, c.reason, c.message, c.type)),
      filteredDataVolumes: dataVolumesStatuses
        .filter((dv) => matchesFilters(filters, DiagnosticCategory.Storage, dv.severity))
        .filter((dv) => filterBySearchText(searchText, dv.name, dv.phase, dv.message)),
      filteredVolumeSnapshots: volumeSnapshotStatuses
        .filter((vss) => matchesFilters(filters, DiagnosticCategory.Storage, vss.severity))
        .filter((vss) => filterBySearchText(searchText, vss.name, vss.reason, vss.message)),
    }),
    [conditions, dataVolumesStatuses, volumeSnapshotStatuses, filters, searchText],
  );

export default useFilteredDiagnosticData;
