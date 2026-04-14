import {
  VirtualMachineInstanceModelGroupVersionKind,
  VirtualMachineModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import { VM_FILTER_OPTIONS } from '@virtualmachines/list/utils/constants';
import { OBJECTS_FETCHING_LIMIT } from '@virtualmachines/utils';

import { useAccessibleResources } from './useAccessibleResources';

type UseVirtualMachineSearchSuggestionResources = (args: {
  cluster?: string;
  namespace: null | string;
}) => {
  vmis: V1VirtualMachineInstance[];
  vmisLoaded: boolean;
  vms: V1VirtualMachine[];
  vmsLoaded: boolean;
};

/**
 * Loads VMs and VMIs for search suggestions using the same scope rules as VirtualMachinesList:
 * namespaced watch when a namespace is selected; otherwise cluster-wide data via useAccessibleResources
 * (per-namespace aggregation for non-admins). Avoids cluster-wide namespaced list watches that never
 * resolve loaded for users who cannot list all namespaces.
 */
export const useVirtualMachineSearchSuggestionResources: UseVirtualMachineSearchSuggestionResources =
  ({ cluster, namespace }) => {
    const [namespacedVMs, namespacedVMsLoaded] = useKubevirtWatchResource<V1VirtualMachine[]>(
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
    );

    const { loaded: accessibleVMsLoaded, resources: accessibleVMs } =
      useAccessibleResources<V1VirtualMachine>(
        VirtualMachineModelGroupVersionKind,
        VM_FILTER_OPTIONS,
      );

    const vms = namespace ? namespacedVMs : accessibleVMs;
    const vmsLoaded = namespace ? namespacedVMsLoaded : accessibleVMsLoaded;

    const [namespacedVMIs, namespacedVMIsLoaded] = useKubevirtWatchResource<
      V1VirtualMachineInstance[]
    >(
      namespace
        ? {
            cluster,
            groupVersionKind: VirtualMachineInstanceModelGroupVersionKind,
            isList: true,
            limit: OBJECTS_FETCHING_LIMIT,
            namespace,
            namespaced: true,
          }
        : null,
    );

    const { loaded: accessibleVMIsLoaded, resources: accessibleVMIs } =
      useAccessibleResources<V1VirtualMachineInstance>(VirtualMachineInstanceModelGroupVersionKind);

    const vmis = namespace ? namespacedVMIs : accessibleVMIs;
    const vmisLoaded = namespace ? namespacedVMIsLoaded : accessibleVMIsLoaded;

    return { vmis, vmisLoaded, vms, vmsLoaded };
  };
