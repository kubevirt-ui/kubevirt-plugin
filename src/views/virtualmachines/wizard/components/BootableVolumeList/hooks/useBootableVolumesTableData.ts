import { useEffect, useMemo, useState } from 'react';

import {
  type V1beta1VirtualMachineClusterPreference,
  type V1beta1VirtualMachinePreference,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import {
  type KubevirtFilter,
  type KubevirtFilterState,
  type OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import useKubevirtDataViewFilters from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/useKubevirtDataViewFilters';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { type PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import { type BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { type NamespacedResourceMap, type ResourceMap } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { type ColumnLayout } from '@openshift-console/dynamic-plugin-sdk';
import { type ThSortType } from '@patternfly/react-table/dist/esm/components/Table/base/types';
import useBootVolumeColumns from '@virtualmachines/wizard/components/BootableVolumeList/hooks/useBootVolumeColumns';
import useBootVolumeSortColumns from '@virtualmachines/wizard/components/BootableVolumeList/hooks/useBootVolumeSortColumns';
import { paginationInitialStateForm } from '@virtualmachines/wizard/components/BootableVolumeList/utils/constants';
import { getBootVolumeTableFilters } from '@virtualmachines/wizard/components/BootableVolumeList/utils/getBootVolumeFilters';
import { filterBootableVolumesByPreference } from '@virtualmachines/wizard/components/BootableVolumeList/utils/utils';
import { type UseBootableVolumesValues } from '@virtualmachines/wizard/utils/types';

import { type TableColumnWithOptionalIndex } from '../types';

type BootableVolumesTableData = {
  activeColumns: TableColumnWithOptionalIndex<BootableVolume>[];
  clearAllFilters: () => void;
  columnLayout: ColumnLayout;
  data: BootableVolume[];
  filterDefinitions: KubevirtFilter<BootableVolume>[];
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
  sortedData: BootableVolume[];
  sortedPaginatedData: BootableVolume[];
  unfilteredData: BootableVolume[];
};

type UseBootableVolumesTableData = (
  volumeListNamespace: string,
  bootableVolumesData: UseBootableVolumesValues,
  preferencesMap: ResourceMap<V1beta1VirtualMachineClusterPreference>,
  userPreferencesMap: NamespacedResourceMap<V1beta1VirtualMachinePreference>,
  preferenceName?: string,
  syncFiltersWithURL?: boolean,
) => BootableVolumesTableData;

const useBootableVolumesTableData: UseBootableVolumesTableData = (
  volumeListNamespace,
  bootableVolumesData,
  preferencesMap,
  userPreferencesMap,
  preferenceName,
  syncFiltersWithURL = true,
) => {
  const { t } = useKubevirtTranslation();

  const { bootableVolumes, dvSources, pvcSources, volumeSnapshotSources } = bootableVolumesData;

  const { activeColumns, columnLayout, loadedColumns } = useBootVolumeColumns(volumeListNamespace);

  const preferenceFilteredVolumes = useMemo(
    () => filterBootableVolumesByPreference(bootableVolumes, preferenceName),
    [bootableVolumes, preferenceName],
  );

  const filterDefinitions = useMemo(
    () => getBootVolumeTableFilters(preferenceFilteredVolumes, preferenceName, t),
    [preferenceFilteredVolumes, preferenceName, t],
  );

  const {
    clearAllFilters,
    filteredData: data,
    filters,
    onSetFilters,
  } = useKubevirtDataViewFilters({
    data: preferenceFilteredVolumes,
    filterDefinitions,
    hideLabelFilter: true,
    syncWithURL: syncFiltersWithURL,
  });

  const [pagination, setPagination] = useState(paginationInitialStateForm);

  useEffect(() => {
    setPagination(paginationInitialStateForm);
  }, [preferenceName]);

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
    !!preferenceName && !isEmpty(bootableVolumes) && isEmpty(preferenceFilteredVolumes);

  const isManualFilterEmpty = !isEmpty(preferenceFilteredVolumes) && isEmpty(data);

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
    unfilteredData: preferenceFilteredVolumes,
  };
};

export default useBootableVolumesTableData;
