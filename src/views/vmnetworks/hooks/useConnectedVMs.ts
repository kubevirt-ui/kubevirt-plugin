import { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName } from '@kubevirt-utils/resources/shared';
import { ClusterUserDefinedNetworkKind } from '@kubevirt-utils/resources/udn/types';

import useConnectedVMsWithNamespace from '../details/hooks/useConnectedVMsWithNamespace';

type UseConnectedVMs = (
  vmNetwork: ClusterUserDefinedNetworkKind,
) => [vms: V1VirtualMachine[], loaded: boolean, error: Error | undefined];

const useConnectedVMs: UseConnectedVMs = (vmNetwork) => {
  const [vmsWithNamespace, loaded, error] = useConnectedVMsWithNamespace(getName(vmNetwork));

  const vms = useMemo(() => vmsWithNamespace.map(({ vm }) => vm), [vmsWithNamespace]);

  return [vms, loaded, error];
};

export default useConnectedVMs;
