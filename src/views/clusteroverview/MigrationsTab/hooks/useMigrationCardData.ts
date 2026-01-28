import { useMemo } from 'react';

import {
  VirtualMachineInstanceMigrationModelGroupVersionKind,
  VirtualMachineInstanceModelGroupVersionKind,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ALL_CLUSTERS_KEY, ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import { useClusterObservabilityDisabled } from '@kubevirt-utils/hooks/useAlerts/utils/useClusterObservabilityDisabled';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useMigrationPolicies from '@kubevirt-utils/hooks/useMigrationPolicies';
import useActiveClusterParam from '@multicluster/hooks/useActiveClusterParam';
import {
  OnFilterChange,
  RowFilter,
  useListPageFilter,
} from '@openshift-console/dynamic-plugin-sdk';
import { AdvancedSearchFilter } from '@stolostron/multicluster-sdk';

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
  filteredVMIMS: V1VirtualMachineInstanceMigration[];
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

  const {
    enabledClusters,
    error: observabilityError,
    loaded: observabilityLoaded,
  } = useClusterObservabilityDisabled(true);

  const normalizedCluster = cluster === ALL_CLUSTERS_KEY ? undefined : cluster;

  const searchQueries = useMemo<AdvancedSearchFilter | undefined>(() => {
    if (cluster === ALL_CLUSTERS_KEY && observabilityLoaded) {
      return [{ property: 'cluster', values: enabledClusters }];
    }
    return undefined;
  }, [cluster, enabledClusters, observabilityLoaded]);

  const [vmims, vmimsLoaded, vmimsErrors] = useKubevirtWatchResource<
    V1VirtualMachineInstanceMigration[]
  >(
    useMemo(
      () => ({
        cluster: normalizedCluster,
        groupVersionKind: VirtualMachineInstanceMigrationModelGroupVersionKind,
        isList: true,
        namespace,
        namespaced: Boolean(namespace),
      }),
      [normalizedCluster, namespace],
    ),
    undefined,
    searchQueries,
  );

  const [vmis, vmisLoaded, vmisErrors] = useKubevirtWatchResource<V1VirtualMachineInstance[]>(
    useMemo(
      () => ({
        cluster: normalizedCluster,
        groupVersionKind: VirtualMachineInstanceModelGroupVersionKind,
        isList: true,
        namespace,
        namespaced: Boolean(namespace),
      }),
      [normalizedCluster, namespace],
    ),
    undefined,
    searchQueries,
  );

  const [mps] = useMigrationPolicies();

  const migrationsData = useMemo(
    () => getMigrationsTableData(vmims, vmis, mps, migrationsDefaultConfigurations, duration),
    [vmims, vmis, mps, migrationsDefaultConfigurations, duration],
  );

  const filters = useMemo(
    () => [...getStatusFilter(), ...getSourceNodeFilter(vmis), ...getTargetNodeFilter(vmis)],
    [vmis],
  );

  const [unfilteredData, data, onFilterChange] = useListPageFilter(migrationsData, filters);

  const filteredVMIMS = useMemo(() => migrationsData.map((item) => item.vmim), [migrationsData]);

  return {
    filteredVMIMS,
    filters,
    loaded: vmimsLoaded && vmisLoaded && observabilityLoaded,
    loadErrors: observabilityError || vmimsErrors || vmisErrors,
    migrationsTableFilteredData: data,
    migrationsTableUnfilteredData: unfilteredData,
    onFilterChange,
    vmims,
  };
};

export default useMigrationCardDataAndFilters;
