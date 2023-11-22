import { useMemo } from 'react';

import { VirtualMachineModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';

type UseVMsPerResource = () => {
  loaded: boolean;
  loadedError: Error;
  vms: V1VirtualMachine[];
};

const useVMsPerResource: UseVMsPerResource = () => {
  const [activeNamespace] = useActiveNamespace();
  const namespace = useMemo(
    () => (activeNamespace === ALL_NAMESPACES_SESSION_KEY ? null : activeNamespace),
    [activeNamespace],
  );

  const [vms, loaded, loadedError] = useK8sWatchResource<V1VirtualMachine[]>({
    groupVersionKind: VirtualMachineModelGroupVersionKind,
    isList: true,
    namespace,
    namespaced: !!namespace,
  });

  return {
    loaded,
    loadedError,
    vms,
  };
};

export default useVMsPerResource;
