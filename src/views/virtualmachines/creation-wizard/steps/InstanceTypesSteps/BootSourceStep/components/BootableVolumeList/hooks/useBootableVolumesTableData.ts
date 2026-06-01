import { useEffect, useMemo, useState } from 'react';

import {
  V1beta1VirtualMachineClusterPreference,
  V1beta1VirtualMachinePreference,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import { PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import useBootableVolumes from '@kubevirt-utils/resources/bootableresources/hooks/useBootableVolumes';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { NamespacedResourceMap, ResourceMap } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  ColumnLayout,
  OnFilterChange,
  RowFilter,
  TableColumn,
  useListPageFilter,
} from '@openshift-console/dynamic-plugin-sdk';
import { ThSortType } from '@patternfly/react-table/dist/esm/components/Table/base/types';
import useInstanceTypeVMStore from '@virtualmachines/creation-wizard/state/instance-type-vm-store/useInstanceTypeVMStore';
import useBootVolumeColumns from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/BootSourceStep/components/BootableVolumeList/hooks/useBootVolumeColumns';
import useBootVolumeFilters from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/BootSourceStep/components/BootableVolumeList/hooks/useBootVolumeFilters';
import useBootVolumeSortColumns from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/BootSourceStep/components/BootableVolumeList/hooks/useBootVolumeSortColumns';
import { paginationInitialStateForm } from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/BootSourceStep/components/BootableVolumeList/utils/constants';
import {
  filterBootableVolumesByPreference,
  isLinuxGenericPreference,
} from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/BootSourceStep/components/BootableVolumeList/utils/utils';

type UseBootableVolumesTableData = (
  volumeListNamespace: string,
  preferencesMap: ResourceMap<V1beta1VirtualMachineClusterPreference>,
  userPreferencesMap: NamespacedResourceMap<V1beta1VirtualMachinePreference>,
) => {
  activeColumns: TableColumn<BootableVolume>[];
  columnLayout: ColumnLayout;
  data: BootableVolume[];
  filters: RowFilter<BootableVolume>[];
  getSortType: (columnIndex: number) => ThSortType;
  isEmptyVolumes: boolean;
  isPreferenceFilterEmpty: boolean;
  loadedColumns: boolean;
  onFilterChange: OnFilterChange;
  pagination: PaginationState;
  setPagination: (
    value: ((prevState: PaginationState) => PaginationState) | PaginationState,
  ) => void;
  sortedData: BootableVolume[];
  sortedPaginatedData: BootableVolume[];
  unfilteredData: BootableVolume[];
};

const useBootableVolumesTableData: UseBootableVolumesTableData = (
  volumeListNamespace,
  preferencesMap,
  userPreferencesMap,
) => {
  const { preference } = useInstanceTypeVMStore();
  const bootableVolumesData = useBootableVolumes(volumeListNamespace);
  const { bootableVolumes, dvSources, pvcSources, volumeSnapshotSources } = bootableVolumesData;

  const preferenceFilteredVolumes = useMemo(
    () => filterBootableVolumesByPreference(bootableVolumes, preference),
    [bootableVolumes, preference],
  );

  const isPreferenceFilterEmpty =
    !!preference && !isEmpty(bootableVolumes) && isEmpty(preferenceFilteredVolumes);

  const allFilters = useBootVolumeFilters(preferenceFilteredVolumes);

  const filters = useMemo(() => {
    if (!preference || isLinuxGenericPreference(preference)) return allFilters;
    return allFilters.filter((f) => f.type !== 'osName');
  }, [allFilters, preference]);

  const [unfilteredData, data, onFilterChange] = useListPageFilter(
    preferenceFilteredVolumes,
    filters,
  );

  const [pagination, setPagination] = useState(paginationInitialStateForm);

  useEffect(() => {
    setPagination(paginationInitialStateForm);
  }, [preference]);

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

  const { activeColumns, columnLayout, loadedColumns } = useBootVolumeColumns(volumeListNamespace);

  return {
    activeColumns,
    columnLayout,
    data,
    filters,
    getSortType,
    isEmptyVolumes: isEmpty(bootableVolumes),
    isPreferenceFilterEmpty,
    loadedColumns,
    onFilterChange,
    pagination,
    setPagination,
    sortedData,
    sortedPaginatedData,
    unfilteredData,
  };
};

export default useBootableVolumesTableData;
