import { useState } from 'react';

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
import {
  ColumnLayout,
  OnFilterChange,
  RowFilter,
  TableColumn,
  useListPageFilter,
} from '@openshift-console/dynamic-plugin-sdk';
import { ThSortType } from '@patternfly/react-table/dist/esm/components/Table/base/types';
import useVMWizardStore from '@virtualmachines/creation-wizard/state/vm-wizard-store/useVMWizardStore';
import useBootVolumeColumns from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/BootSourceStep/components/BootableVolumeList/hooks/useBootVolumeColumns';
import useBootVolumeFilters from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/BootSourceStep/components/BootableVolumeList/hooks/useBootVolumeFilters';
import useBootVolumeSortColumns from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/BootSourceStep/components/BootableVolumeList/hooks/useBootVolumeSortColumns';
import {
  paginationInitialStateForm,
  paginationInitialStateModal,
} from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/BootSourceStep/components/BootableVolumeList/utils/constants';

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
  const bootableVolumesData = useBootableVolumes(volumeListNamespace);
  const { bootableVolumes, dvSources, pvcSources, volumeSnapshotSources } = bootableVolumesData;

  const favoritesData = useKubevirtUserSettings('favoriteBootableVolumes', cluster);
  const [favorites = [], updaterFavorites] = favoritesData;
  const volumeFavorites = favorites as [];

  const filters = useBootVolumeFilters(bootableVolumes, !displayShowAllButton);

  const [unfilteredData, data, onFilterChange] = useListPageFilter(bootableVolumes, filters);

  const [pagination, setPagination] = useState(
    displayShowAllButton ? paginationInitialStateForm : paginationInitialStateModal,
  );

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
