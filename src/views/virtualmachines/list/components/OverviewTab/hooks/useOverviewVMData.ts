import { VirtualMachineModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useIsACMPage from '@multicluster/useIsACMPage';
import { useAccessibleResources } from '@virtualmachines/search/hooks/useAccessibleResources';
import useFleetVMInventory from '@virtualmachines/tree/hooks/useFleetVMInventory';
import { isHardInventoryError } from '@virtualmachines/tree/utils/isHardInventoryError';

type OverviewVMData = {
  error?: Error;
  isSoftError: boolean;
  refresh?: () => void;
  vms: V1VirtualMachine[];
  vmsLoaded: boolean;
};

const useOverviewVMData = (namespace?: string, cluster?: string): OverviewVMData => {
  const isACMPage = useIsACMPage();
  const fleetInventory = useFleetVMInventory(namespace, cluster);

  const {
    loaded: vmsLoaded,
    loadError,
    resources: vms,
  } = useAccessibleResources<V1VirtualMachine>({
    clusters: cluster ? [cluster] : undefined,
    groupVersionKind: VirtualMachineModelGroupVersionKind,
    isWatchEnabled: !isACMPage,
    namespace,
  });

  if (isACMPage) {
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

export default useOverviewVMData;
