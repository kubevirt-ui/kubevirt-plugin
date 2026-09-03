import { VirtualMachineModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import { useAccessibleResources } from '@virtualmachines/search/hooks/useAccessibleResources';
import useVMSearchQueries from '@virtualmachines/search/hooks/useVMSearchQueries';
import { OBJECTS_FETCHING_LIMIT } from '@virtualmachines/utils';

import { VM_FILTER_OPTIONS } from '../utils/constants';

type VMDataSourceResult = {
  accessibleVMs: V1VirtualMachine[];
  vms: V1VirtualMachine[];
  vmsLoaded: boolean;
  vmsLoadError: Error;
};

export const useVMDataSource = (namespace: string, cluster?: string): VMDataSourceResult => {
  const searchQueries = useVMSearchQueries();

  const [namespacedVMs, namespacedVMsLoaded, loadError] = useKubevirtWatchResource<
    V1VirtualMachine[]
  >(
    namespace
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

  const accessibleVMsResults = useAccessibleResources<V1VirtualMachine>({
    filterOptions: VM_FILTER_OPTIONS,
    groupVersionKind: VirtualMachineModelGroupVersionKind,
  });
  const { loaded: accessibleVMsLoaded, resources: accessibleVMs } = accessibleVMsResults;
  const accessibleVMsError = accessibleVMsResults.loadError as Error;

  const vms = namespace ? namespacedVMs : accessibleVMs;
  const vmsLoaded = namespace ? namespacedVMsLoaded : accessibleVMsLoaded;
  const vmsLoadError = namespace ? loadError : accessibleVMsError;

  return { accessibleVMs, vms, vmsLoaded, vmsLoadError };
};
