import { useMemo } from 'react';

import {
  VirtualMachineInstanceMigrationModelGroupVersionKind,
  VirtualMachineInstanceModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console';
import {
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import useMigrationPolicies from '@kubevirt-utils/hooks/useMigrationPolicies';
import useActiveClusterParam from '@multicluster/hooks/useActiveClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import {
  OnFilterChange,
  RowFilter,
  useListPageFilter,
} from '@openshift-console/dynamic-plugin-sdk';

import useHyperConvergedMigrations from '../components/MigrationsLimitionsPopover/hooks/useHyperConvergedMigrations';
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
  filters: RowFilter<MigrationTableDataLayout>[];
  loaded: boolean;
  loadErrors: Error | unknown;
  migrationsTableFilteredData: MigrationTableDataLayout[];
  migrationsTableUnfilteredData: MigrationTableDataLayout[];
  onFilterChange: OnFilterChange;
  vmims: V1VirtualMachineInstanceMigration[];
};

type UseMigrationCardDataAndFilters = (duration: string) => UseMigrationCardDataAndFiltersValues;

const useMigrationCardDataAndFilters: UseMigrationCardDataAndFilters = (duration: string) => {
  const migrationsDefaultConfigurations = useHyperConvergedMigrations();
  const activeNamespace = useActiveNamespace();
  const cluster = useActiveClusterParam();
  const namespace = useMemo(
    () => (activeNamespace !== ALL_NAMESPACES_SESSION_KEY ? activeNamespace : undefined),
    [activeNamespace],
  );

  const [vmims, vmimsLoaded, vmimsErrors] = useK8sWatchData<V1VirtualMachineInstanceMigration[]>(
    useMemo(
      () => ({
        cluster,
        groupVersionKind: VirtualMachineInstanceMigrationModelGroupVersionKind,
        isList: true,
        namespace,
        namespaced: Boolean(namespace),
      }),
      [cluster, namespace],
    ),
  );

  const [vmis, vmisLoaded, vmisErrors] = useK8sWatchData<V1VirtualMachineInstance[]>(
    useMemo(
      () => ({
        cluster,
        groupVersionKind: VirtualMachineInstanceModelGroupVersionKind,
        isList: true,
        namespace,
        namespaced: Boolean(namespace),
      }),
      [cluster, namespace],
    ),
  );

  const [mps] = useMigrationPolicies();

  const migrationsData = getMigrationsTableData(
    vmims,
    vmis,
    mps,
    migrationsDefaultConfigurations,
    duration,
  );

  const filters = [
    ...getStatusFilter(),
    ...getSourceNodeFilter(vmis),
    ...getTargetNodeFilter(vmis),
  ];
  const [unfilteredData, data, onFilterChange] = useListPageFilter(migrationsData, filters);

  return {
    filters,
    loaded: vmimsLoaded && vmisLoaded,
    loadErrors: vmimsErrors || vmisErrors,
    migrationsTableFilteredData: data,
    migrationsTableUnfilteredData: unfilteredData,
    onFilterChange,
    vmims,
  };
};

export default useMigrationCardDataAndFilters;
