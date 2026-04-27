import { useEffect, useMemo, useState } from 'react';

import {
  V1beta1VirtualMachineClusterPreference,
  V1beta1VirtualMachinePreference,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import useKubevirtUserSettings from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettings';
import { UserSettingFavorites } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/types';
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
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import useBootVolumeColumns from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/BootSourceStep/components/BootableVolumeList/hooks/useBootVolumeColumns';
import useBootVolumeFilters from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/BootSourceStep/components/BootableVolumeList/hooks/useBootVolumeFilters';
import useBootVolumeSortColumns from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/BootSourceStep/components/BootableVolumeList/hooks/useBootVolumeSortColumns';
import {
  paginationInitialStateForm,
  paginationInitialStateModal,
} from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/BootSourceStep/components/BootableVolumeList/utils/constants';
import {
  filterBootableVolumesByPreference,
  isLinuxGenericPreference,
} from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/BootSourceStep/components/BootableVolumeList/utils/utils';

type UseBootableVolumesTableData = (
  volumeListNamespace: string,
  displayShowAllButton: boolean,
  preferencesMap: ResourceMap<V1beta1VirtualMachineClusterPreference>,
  userPreferencesMap: NamespacedResourceMap<V1beta1VirtualMachinePreference>,
) => {
  activeColumns: TableColumn<BootableVolume>[];
  columnLayout: ColumnLayout;
  data: BootableVolume[];
  favorites: UserSettingFavorites;
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
  displayShowAllButton,
  preferencesMap,
  userPreferencesMap,
) => {
  const { cluster } = useVMWizardStore();
  const { preference } = useInstanceTypeVMStore();
  const bootableVolumesData = useBootableVolumes(volumeListNamespace);
  const { bootableVolumes, dvSources, pvcSources, volumeSnapshotSources } = bootableVolumesData;

  const preferenceFilteredVolumes = useMemo(
    () => filterBootableVolumesByPreference(bootableVolumes, preference),
    [bootableVolumes, preference],
  );

  const isPreferenceFilterEmpty =
    !!preference && !isEmpty(bootableVolumes) && isEmpty(preferenceFilteredVolumes);

  const favoritesData = useKubevirtUserSettings('favoriteBootableVolumes', cluster);
  const [favorites = [], updaterFavorites] = favoritesData;
  const volumeFavorites = favorites as [];

  const allFilters = useBootVolumeFilters(preferenceFilteredVolumes, !displayShowAllButton);

  const filters = useMemo(() => {
    if (!preference || isLinuxGenericPreference(preference)) return allFilters;
    const osFilterType = `osName${!displayShowAllButton && '-modal'}`;
    return allFilters.filter((f) => f.type !== osFilterType);
  }, [allFilters, preference, displayShowAllButton]);

  const [unfilteredData, data, onFilterChange] = useListPageFilter(
    preferenceFilteredVolumes,
    filters,
  );

  const [pagination, setPagination] = useState(
    displayShowAllButton ? paginationInitialStateForm : paginationInitialStateModal,
  );

  useEffect(() => {
    setPagination(displayShowAllButton ? paginationInitialStateForm : paginationInitialStateModal);
  }, [preference, displayShowAllButton]);

  const { getSortType, sortedData, sortedPaginatedData } = useBootVolumeSortColumns(
    data,
    volumeFavorites,
    preferencesMap,
    userPreferencesMap,
    pvcSources,
    volumeSnapshotSources,
    pagination,
    volumeListNamespace === ALL_PROJECTS,
    dvSources,
  );

  const { activeColumns, columnLayout, loadedColumns } = useBootVolumeColumns(
    volumeListNamespace,
    !displayShowAllButton,
  );

  return {
    activeColumns,
    columnLayout,
    data,
    favorites: [favorites as [], updaterFavorites],
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
