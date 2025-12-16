import { useMemo } from 'react';

import { VirtualMachineModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ALL_CLUSTERS_KEY, ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useActiveClusterParam from '@multicluster/hooks/useActiveClusterParam';

type UseVMsPerResource = () => {
  loaded: boolean;
  loadedError: Error;
  vms: V1VirtualMachine[];
};

const useVMsPerResource: UseVMsPerResource = () => {
  const activeNamespace = useActiveNamespace();
  const cluster = useActiveClusterParam();
  const namespace = useMemo(
    () => (activeNamespace === ALL_NAMESPACES_SESSION_KEY ? undefined : activeNamespace),
    [activeNamespace],
  );

  const normalizedCluster = cluster === ALL_CLUSTERS_KEY ? undefined : cluster;

  const watchResource = useMemo(
    () => ({
      cluster: normalizedCluster,
      groupVersionKind: VirtualMachineModelGroupVersionKind,
      isList: true,
      namespace,
      namespaced: !!namespace,
    }),
    [normalizedCluster, namespace],
  );

  const [vms, loaded, loadedError] = useKubevirtWatchResource<V1VirtualMachine[]>(watchResource);

  return {
    loaded,
    loadedError,
    vms,
  };
};

export default useVMsPerResource;
