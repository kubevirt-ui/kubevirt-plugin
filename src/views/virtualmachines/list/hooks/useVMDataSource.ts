import { VirtualMachineModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useIsACMPage from '@multicluster/useIsACMPage';
import { useSignals } from '@preact/signals-react/runtime';
import { useAccessibleResources } from '@virtualmachines/search/hooks/useAccessibleResources';
import useVMSearchQueries from '@virtualmachines/search/hooks/useVMSearchQueries';
import useFleetVMInventory from '@virtualmachines/tree/hooks/useFleetVMInventory';
import { isHardInventoryError } from '@virtualmachines/tree/utils/isHardInventoryError';
import { vmsSignal } from '@virtualmachines/tree/utils/signals';
import { OBJECTS_FETCHING_LIMIT } from '@virtualmachines/utils';

import { VM_FILTER_OPTIONS } from '../utils/constants';
import { filterVMsByClusterAndNamespace } from '../utils/utils';

type VMDataSourceResult = {
  accessibleVMs: V1VirtualMachine[];
  error?: Error;
  isSoftError: boolean;
  refresh?: () => void;
  vms: V1VirtualMachine[];
  vmsLoaded: boolean;
};

export const useVMDataSource = (namespace: string, cluster?: string): VMDataSourceResult => {
  useSignals();
  const isACMPage = useIsACMPage();
  const searchQueries = useVMSearchQueries();
  const fleetInventory = useFleetVMInventory(namespace, cluster);

  const [namespacedVMs, namespacedVMsLoaded, namespacedLoadError] = useKubevirtWatchResource<
    V1VirtualMachine[]
  >(
    !isACMPage && namespace
      ? {
          cluster,
          groupVersionKind: VirtualMachineModelGroupVersionKind,
          isList: true,
          limit: OBJECTS_FETCHING_LIMIT,
          namespace,
          namespaced: true,
        }
      : null,
    VM_FILTER_OPTIONS,
    searchQueries?.vmQueries,
  );

  const {
    loaded: accessibleVMsLoaded,
    loadError: accessibleVMsError,
    resources: accessibleVMs,
  } = useAccessibleResources<V1VirtualMachine>({
    filterOptions: VM_FILTER_OPTIONS,
    groupVersionKind: VirtualMachineModelGroupVersionKind,
    isWatchEnabled: !isACMPage,
  });

  if (isACMPage) {
    const { error, loaded, refresh, vms } = fleetInventory;
    const isSoftError = Boolean(error && !isHardInventoryError(error));

    return {
      accessibleVMs: filterVMsByClusterAndNamespace(vmsSignal.value, '', cluster),
      error,
      isSoftError,
      refresh,
      vms,
      vmsLoaded: loaded,
    };
  }

  const vms = namespace ? namespacedVMs : accessibleVMs;
  const vmsLoaded = namespace ? namespacedVMsLoaded : accessibleVMsLoaded;
  const error = namespace ? namespacedLoadError : accessibleVMsError;

  return {
    accessibleVMs,
    error,
    isSoftError: false,
    vms,
    vmsLoaded,
  };
};
