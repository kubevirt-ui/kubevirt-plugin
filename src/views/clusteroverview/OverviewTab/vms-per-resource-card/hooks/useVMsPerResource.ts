import { useMemo } from 'react';

import { VirtualMachineModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import useActiveClusterParam from '@multicluster/hooks/useActiveClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

type UseVMsPerResource = () => {
  loaded: boolean;
  loadedError: Error;
  vms: V1VirtualMachine[];
};

const useVMsPerResource: UseVMsPerResource = () => {
  const activeNamespace = useActiveNamespace();
  const cluster = useActiveClusterParam();
  const namespace = useMemo(
    () => (activeNamespace === ALL_NAMESPACES_SESSION_KEY ? null : activeNamespace),
    [activeNamespace],
  );

  const watchResource = useMemo(
    () => ({
      cluster,
      groupVersionKind: VirtualMachineModelGroupVersionKind,
      isList: true,
      namespace,
      namespaced: !!namespace,
    }),
    [cluster, namespace],
  );

  const [vms, loaded, loadedError] = useK8sWatchData<V1VirtualMachine[]>(watchResource);

  return {
    loaded,
    loadedError,
    vms,
  };
};

export default useVMsPerResource;
