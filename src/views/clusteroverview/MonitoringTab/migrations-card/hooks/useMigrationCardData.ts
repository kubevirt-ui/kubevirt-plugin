import {
  MigrationPolicyModelGroupVersionKind,
  VirtualMachineInstanceMigrationModelGroupVersionKind,
  VirtualMachineInstanceModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console';
import {
  V1alpha1MigrationPolicy,
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  OnFilterChange,
  RowFilter,
  useK8sWatchResource,
  useListPageFilter,
} from '@openshift-console/dynamic-plugin-sdk';

import useHCMigrations from '../components/MigrationsLimitionsPopover/hooks/useHCMigrations';
import {
  getSourceNodeFilter,
  getStatusFilter,
  getTargetNodeFilter,
} from '../components/MigrationsTable/utils/filters';
import {
  getMigrationsTableData,
  MigrationTableDataLayout,
} from '../components/MigrationsTable/utils/utils';

export type UseMigrationCardDataAndFiltersValues = {
  vmims: V1VirtualMachineInstanceMigration[];
  loaded: boolean;
  loadErrors: any;
  filters: RowFilter<any>[];
  migrationsTableUnfilteredData: MigrationTableDataLayout[];
  migrationsTableFilteredData: MigrationTableDataLayout[];
  onFilterChange: OnFilterChange;
};

type UseMigrationCardDataAndFilters = (duration: string) => UseMigrationCardDataAndFiltersValues;

const useMigrationCardDataAndFilters: UseMigrationCardDataAndFilters = (duration: string) => {
  const { t } = useKubevirtTranslation();
  const migrationsDefaultConfigurations = useHCMigrations();

  const [vmims, vmimsLoaded, vmimsErrors] = useK8sWatchResource<
    V1VirtualMachineInstanceMigration[]
  >({
    groupVersionKind: VirtualMachineInstanceMigrationModelGroupVersionKind,
    isList: true,
  });

  const [vmis, vmisLoaded, vmisErrors] = useK8sWatchResource<V1VirtualMachineInstance[]>({
    groupVersionKind: VirtualMachineInstanceModelGroupVersionKind,
    isList: true,
  });

  const [mps] = useK8sWatchResource<V1alpha1MigrationPolicy[]>({
    groupVersionKind: MigrationPolicyModelGroupVersionKind,
    isList: true,
  });

  const migrationsData = getMigrationsTableData(
    vmims,
    vmis,
    mps,
    migrationsDefaultConfigurations,
    duration,
  );

  const filters = [
    ...getStatusFilter(t),
    ...getSourceNodeFilter(vmis, t),
    ...getTargetNodeFilter(vmis, t),
  ];
  const [unfilteredData, data, onFilterChange] = useListPageFilter(migrationsData, filters);

  return {
    vmims,
    loaded: vmimsLoaded && vmisLoaded,
    loadErrors: vmimsErrors || vmisErrors,
    filters,
    migrationsTableUnfilteredData: unfilteredData,
    migrationsTableFilteredData: data,
    onFilterChange,
  };
};

export default useMigrationCardDataAndFilters;
