import { useEffect, useMemo, useState } from 'react';
import { useWatch } from 'react-hook-form';

import type {
  V1beta1VirtualMachineClusterPreference,
  V1beta1VirtualMachinePreference,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
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
import type { NamespacedResourceMap, ResourceMap } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import type { ColumnLayout } from '@openshift-console/dynamic-plugin-sdk';
import type { ThSortType } from '@patternfly/react-table/dist/esm/components/Table/base/types';
import { useVMWizard } from '@virtualmachines/wizard/state/vm-wizard-context/VMWizardContext';
import { CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA } from '@virtualmachines/wizard/state/vm-wizard-form/consts';
import useBootVolumeColumns from '@virtualmachines/wizard/steps/InstanceTypesSteps/BootSourceStep/components/BootableVolumeList/hooks/useBootVolumeColumns';
import useBootVolumeSortColumns from '@virtualmachines/wizard/steps/InstanceTypesSteps/BootSourceStep/components/BootableVolumeList/hooks/useBootVolumeSortColumns';
import { paginationInitialStateForm } from '@virtualmachines/wizard/steps/InstanceTypesSteps/BootSourceStep/components/BootableVolumeList/utils/constants';
import { getBootVolumeTableFilters } from '@virtualmachines/wizard/steps/InstanceTypesSteps/BootSourceStep/components/BootableVolumeList/utils/getBootVolumeFilters';
import { filterBootableVolumesByPreference } from '@virtualmachines/wizard/steps/InstanceTypesSteps/BootSourceStep/components/BootableVolumeList/utils/utils';
import type { UseBootableVolumesValues } from '@virtualmachines/wizard/utils/types';

import type { TableColumnWithOptionalIndex } from '../../../types';

type BootableVolumesTableData = {
  activeColumns: TableColumnWithOptionalIndex<BootableVolume>[];
  clearAllFilters: () => void;
  columnLayout: ColumnLayout;
  data: BootableVolume[];
  filterDefinitions: KubevirtFilter<BootableVolume>[];
  filters: KubevirtFilterState;
  getSortType: (columnIndex: number) => ThSortType;
  isEmptyVolumes: boolean;
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
) => BootableVolumesTableData;

const useBootableVolumesTableData: UseBootableVolumesTableData = (
  volumeListNamespace,
  bootableVolumesData,
  preferencesMap,
  userPreferencesMap,
) => {
  const { control } = useVMWizard();
  const { t } = useKubevirtTranslation();
  const preference = useWatch({
    control,
    name: CREATE_VM_FORM_FIELDS_INSTANCE_TYPE_DATA.PREFERENCE,
  });
  const preferenceName = preference?.name;

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

  return {
    activeColumns,
    clearAllFilters,
    columnLayout,
    data,
    filterDefinitions,
    filters,
    getSortType,
    isEmptyVolumes: isEmpty(bootableVolumes),
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
