import { VirtualMachineModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useIsACMPage from '@multicluster/useIsACMPage';
import { useSignals } from '@preact/signals-react/runtime';
import { useAccessibleResources } from '@virtualmachines/search/hooks/useAccessibleResources';
import useVMSearchQueries from '@virtualmachines/search/hooks/useVMSearchQueries';
import useFleetVMInventory from '@virtualmachines/tree/hooks/useFleetVMInventory';
import { isHardInventoryError } from '@virtualmachines/tree/utils/isHardInventoryError';

import { VM_FILTER_OPTIONS } from '../utils/constants';

type VMDataSourceResult = {
  error?: Error;
  isSoftError: boolean;
  refresh?: () => void;
  vms: V1VirtualMachine[];
  vmsLoaded: boolean;
};

export const useVMDataSource = (namespace?: string, cluster?: string): VMDataSourceResult => {
  useSignals();
  const isACMPage = useIsACMPage();
  const searchQueries = useVMSearchQueries();
  const fleetInventory = useFleetVMInventory(namespace, cluster);

  const {
    loaded: vmsLoaded,
    loadError,
    resources: vms,
  } = useAccessibleResources<V1VirtualMachine>({
    clusters: cluster ? [cluster] : undefined,
    filterOptions: VM_FILTER_OPTIONS,
    groupVersionKind: VirtualMachineModelGroupVersionKind,
    isWatchEnabled: !isACMPage,
    namespace,
    searchQueries: searchQueries?.vmQueries,
  });

  if (isACMPage) {
    // +TODO: use searchQueries to filter fleetVMs
    const { error, loaded, refresh, vms: fleetVMs } = fleetInventory;
    const isSoftError = Boolean(error && !isHardInventoryError(error));

    return {
      error,
      isSoftError,
      refresh,
      vms: fleetVMs,
      vmsLoaded: loaded,
    };
  }

  return {
    error: loadError,
    isSoftError: false,
    vms,
    vmsLoaded,
  };
};
