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
import {
  KubevirtFilter,
  KubevirtFilterState,
  OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import useKubevirtDataViewFilters from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/useKubevirtDataViewFilters';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useMigrationPolicies from '@kubevirt-utils/hooks/useMigrationPolicies';
import useActiveClusterParam from '@multicluster/hooks/useActiveClusterParam';
import { AdvancedSearchFilter } from '@stolostron/multicluster-sdk';

import useHyperConvergedMigrations from '../components/LiveMigrationSettingsPopover/hooks/useHyperConvergedMigrations';
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
  clearAllFilters: () => void;
  filterDefinitions: KubevirtFilter<MigrationTableDataLayout>[];
  filteredVMIMS: V1VirtualMachineInstanceMigration[];
  filters: KubevirtFilterState;
  loaded: boolean;
  loadErrors: Error | unknown;
  migrationsTableFilteredData: MigrationTableDataLayout[];
  migrationsTableUnfilteredData: MigrationTableDataLayout[];
  onSetFilters: OnSetFilters;
  vmims: V1VirtualMachineInstanceMigration[];
};

type UseMigrationCardDataAndFilters = (duration: string) => UseMigrationCardDataAndFiltersValues;

const useMigrationCardDataAndFilters: UseMigrationCardDataAndFilters = (duration: string) => {
  const { t } = useKubevirtTranslation();
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

  const filterDefinitions = useMemo(
    () => [...getStatusFilter(t), ...getSourceNodeFilter(t, vmis), ...getTargetNodeFilter(t, vmis)],
    [t, vmis],
  );

  const { clearAllFilters, filteredData, filters, onSetFilters } = useKubevirtDataViewFilters({
    data: migrationsData,
    filterDefinitions,
  });

  const filteredVMIMS = useMemo(() => migrationsData.map((item) => item.vmim), [migrationsData]);

  return {
    clearAllFilters,
    filterDefinitions,
    filteredVMIMS,
    filters,
    loaded: vmimsLoaded && vmisLoaded && observabilityLoaded,
    loadErrors: observabilityError || vmimsErrors || vmisErrors,
    migrationsTableFilteredData: filteredData,
    migrationsTableUnfilteredData: migrationsData,
    onSetFilters,
    vmims,
  };
};

export default useMigrationCardDataAndFilters;
