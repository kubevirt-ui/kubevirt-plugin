import { VirtualMachineModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useIsACMPage from '@multicluster/useIsACMPage';
import { type WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';
import { useAccessibleResources } from '@virtualmachines/search/hooks/useAccessibleResources';
import useFleetVMInventory from '@virtualmachines/tree/hooks/useFleetVMInventory';
import { isHardInventoryError } from '@virtualmachines/tree/utils/isHardInventoryError';
import { OBJECTS_FETCHING_LIMIT } from '@virtualmachines/utils';

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

  const [watchedVms, watchedVmsLoaded, watchedVmsError] = useKubevirtWatchResource<
    V1VirtualMachine[]
  >(
    (!isACMPage && namespace
      ? {
          cluster,
          groupVersionKind: VirtualMachineModelGroupVersionKind,
          isList: true,
          limit: OBJECTS_FETCHING_LIMIT,
          namespace,
          namespaced: true,
        }
      : null) as WatchK8sResource,
  );

  const {
    loaded: accessibleVmsLoaded,
    loadError: accessibleVmsError,
    resources: accessibleVms,
  } = useAccessibleResources<V1VirtualMachine>({
    groupVersionKind: VirtualMachineModelGroupVersionKind,
    isWatchEnabled: !isACMPage,
    namespace: namespace ?? undefined,
  });

  if (isACMPage) {
    const { error, loaded, refresh, vms } = fleetInventory;
    const isSoftError = Boolean(error && !isHardInventoryError(error));

    return {
      error,
      isSoftError,
      refresh,
      vms,
      vmsLoaded: loaded,
    };
  }

  const vms = namespace ? watchedVms : accessibleVms;
  const vmsLoaded = namespace ? watchedVmsLoaded : accessibleVmsLoaded;
  const error = (namespace ? watchedVmsError : accessibleVmsError) as Error | undefined;

  return {
    error,
    isSoftError: false,
    vms,
    vmsLoaded,
  };
};

export default useOverviewVMData;
