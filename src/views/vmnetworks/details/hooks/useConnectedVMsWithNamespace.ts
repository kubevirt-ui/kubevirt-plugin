import { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { VirtualMachineModelGroupVersionKind } from '@kubevirt-utils/models';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { getMatchingNetworkNamespace } from '../utils';

type UseConnectedVMsWithNamespace = (
  vmNetworkName: string,
) => [
  vmsWithNamespace: { namespace: string; vm: V1VirtualMachine }[],
  loaded: boolean,
  error: Error | undefined,
];

/**
 * Hook to get all VirtualMachines connected to a specific VM network (ClusterUserDefinedNetwork) with the namespace of the network.
 * @param vmNetworkName - The name of the VM network (CUDN name)
 * @returns Tuple of [filtered VMs with network namespace, loaded state, error]
 */
const useConnectedVMsWithNamespace: UseConnectedVMsWithNamespace = (vmNetworkName) => {
  const [vms, loaded, error] = useK8sWatchResource<V1VirtualMachine[]>({
    groupVersionKind: VirtualMachineModelGroupVersionKind,
    isList: true,
    namespaced: false,
  });

  const vmsWithNamespace = useMemo(
    () =>
      vms
        .map((vm) => ({ namespace: getMatchingNetworkNamespace(vm, vmNetworkName), vm }))
        .filter(({ namespace }) => namespace),
    [vms, vmNetworkName],
  );

  return [vmsWithNamespace, loaded, error];
};

export default useConnectedVMsWithNamespace;
