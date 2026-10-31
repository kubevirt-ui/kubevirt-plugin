import { useEffect, useMemo, useState } from 'react';

import type {
  V1beta1VirtualMachineClusterPreference,
  V1beta1VirtualMachinePreference,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type PreferenceOption } from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import { ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import type {
  KubevirtFilter,
  KubevirtFilterState,
  OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import useKubevirtDataViewFilters from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/useKubevirtDataViewFilters';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import type { PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import type { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { type NamespacedResourceMap, type ResourceMap } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import type { ColumnLayout } from '@openshift-console/dynamic-plugin-sdk';
import type { ThSortType } from '@patternfly/react-table/dist/esm/components/Table/base/types';
import useBootVolumeColumns from '@virtualmachines/wizard/components/BootableVolumeList/hooks/useBootVolumeColumns';
import useBootVolumeSortColumns from '@virtualmachines/wizard/components/BootableVolumeList/hooks/useBootVolumeSortColumns';
import { paginationInitialStateForm } from '@virtualmachines/wizard/components/BootableVolumeList/utils/constants';
import { getBootVolumeTableFilters } from '@virtualmachines/wizard/components/BootableVolumeList/utils/getBootVolumeFilters';
import {
  expandVolumesToTableRows,
  filterBootableVolumesByPreference,
} from '@virtualmachines/wizard/components/BootableVolumeList/utils/utils';
import {
  type BootVolumeTableRow,
  type UseBootableVolumesValues,
} from '@virtualmachines/wizard/utils/types';

import type { TableColumnWithOptionalIndex } from '../types';

type BootableVolumesTableData = {
  activeColumns: TableColumnWithOptionalIndex<BootableVolume>[];
  clearAllFilters: () => void;
  columnLayout: ColumnLayout;
  data: BootVolumeTableRow[];
  filterDefinitions: KubevirtFilter<BootVolumeTableRow>[];
  filters: KubevirtFilterState;
  getSortType: (columnIndex: number) => ThSortType;
  isEmptyVolumes: boolean;
  isManualFilterEmpty: boolean;
  isPreferenceFilterEmpty: boolean;
  loadedColumns: boolean;
  onSetFilters: OnSetFilters;
  pagination: PaginationState;
  setPagination: (
    value: ((prevState: PaginationState) => PaginationState) | PaginationState,
  ) => void;
  sortedData: BootVolumeTableRow[];
  sortedPaginatedData: BootVolumeTableRow[];
  unfilteredData: BootVolumeTableRow[];
};

type UseBootableVolumesTableData = (
  volumeListNamespace: string,
  bootableVolumesData: UseBootableVolumesValues,
  preferencesMap: ResourceMap<V1beta1VirtualMachineClusterPreference>,
  userPreferencesMap: NamespacedResourceMap<V1beta1VirtualMachinePreference>,
  guestOperatingSystem?: PreferenceOption,
  syncFiltersWithURL?: boolean,
) => BootableVolumesTableData;

const useBootableVolumesTableData: UseBootableVolumesTableData = (
  volumeListNamespace,
  bootableVolumesData,
  preferencesMap,
  userPreferencesMap,
  guestOperatingSystem,
  syncFiltersWithURL = true,
) => {
  const { t } = useKubevirtTranslation();

  const { bootableVolumes, dvSources, pvcSources, volumeSnapshotSources } = bootableVolumesData;

  const { activeColumns, columnLayout, loadedColumns } = useBootVolumeColumns(volumeListNamespace);

  // When guest OS has availablePreferences, expand volumes to table rows (one per variant)
  // Otherwise, filter volumes by preference name (for template flow) and create single rows
  const tableRows = useMemo(() => {
    if (guestOperatingSystem?.availablePreferences) {
      return expandVolumesToTableRows(bootableVolumes, guestOperatingSystem);
    }

    const filteredVolumes = guestOperatingSystem?.name
      ? filterBootableVolumesByPreference(bootableVolumes, guestOperatingSystem.name)
      : bootableVolumes;

    return expandVolumesToTableRows(filteredVolumes, undefined);
  }, [bootableVolumes, guestOperatingSystem]);

  const filterDefinitions = useMemo(
    () => getBootVolumeTableFilters(tableRows, guestOperatingSystem, t),
    [tableRows, guestOperatingSystem, t],
  );

  const {
    clearAllFilters,
    filteredData: data,
    filters,
    onSetFilters,
  } = useKubevirtDataViewFilters({
    data: tableRows,
    filterDefinitions,
    hideLabelFilter: true,
    syncWithURL: syncFiltersWithURL,
  });

  const [pagination, setPagination] = useState(paginationInitialStateForm);

  useEffect(() => {
    setPagination(paginationInitialStateForm);
  }, [guestOperatingSystem?.name]);

  const { getSortType, sortedData, sortedPaginatedData } = useBootVolumeSortColumns(
    data,
    preferencesMap,
    userPreferencesMap,
    pvcSources,
    volumeSnapshotSources,
    pagination,
    volumeListNamespace === ALL_PROJECTS,
    dvSources,
  );

  const isPreferenceFilterEmpty =
    !!guestOperatingSystem?.name && !isEmpty(bootableVolumes) && isEmpty(tableRows);

  const isManualFilterEmpty = !isEmpty(tableRows) && isEmpty(data);

  return {
    activeColumns,
    clearAllFilters,
    columnLayout,
    data,
    filterDefinitions,
    filters,
    getSortType,
    isEmptyVolumes: isEmpty(bootableVolumes),
    isManualFilterEmpty,
    isPreferenceFilterEmpty,
    loadedColumns,
    onSetFilters,
    pagination,
    setPagination,
    sortedData,
    sortedPaginatedData,
    unfilteredData: tableRows,
  };
};

export default useBootableVolumesTableData;
