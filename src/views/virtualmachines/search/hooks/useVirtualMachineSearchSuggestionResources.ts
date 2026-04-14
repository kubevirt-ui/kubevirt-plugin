import {
  VirtualMachineInstanceModelGroupVersionKind,
  VirtualMachineModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useIsACMPage from '@multicluster/useIsACMPage';
import { VM_FILTER_OPTIONS } from '@virtualmachines/list/utils/constants';

import { useAccessibleResources } from './useAccessibleResources';

type UseVirtualMachineSearchSuggestionResources = () => {
  vmis: V1VirtualMachineInstance[];
  vmisLoaded: boolean;
  vms: V1VirtualMachine[];
  vmsLoaded: boolean;
};

/**
 * VM search suggestions load accessible VMs/VMIs across namespaces (per-namespace for non-admins on
 * single-cluster console). On ACM, passes `cluster: undefined` so fleet search includes all managed
 * clusters; otherwise passes the cluster from the route.
 */
export const useVirtualMachineSearchSuggestionResources: UseVirtualMachineSearchSuggestionResources =
  () => {
    const isACMPage = useIsACMPage();
    const clusterFromRoute = useClusterParam();
    const searchCluster = isACMPage ? undefined : clusterFromRoute;

    const { loaded: accessibleVMsLoaded, resources: accessibleVMs } =
      useAccessibleResources<V1VirtualMachine>(VirtualMachineModelGroupVersionKind, {
        cluster: searchCluster,
        filterOptions: VM_FILTER_OPTIONS,
      });

    const { loaded: accessibleVMIsLoaded, resources: accessibleVMIs } =
      useAccessibleResources<V1VirtualMachineInstance>(
        VirtualMachineInstanceModelGroupVersionKind,
        {
          cluster: searchCluster,
        },
      );

    return {
      vmis: accessibleVMIs,
      vmisLoaded: accessibleVMIsLoaded,
      vms: accessibleVMs,
      vmsLoaded: accessibleVMsLoaded,
    };
  };
