import { useMemo } from 'react';

import { type IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { modelToGroupVersionKind, NodeModel } from '@kubevirt-utils/models';
import { getArchitecture } from '@kubevirt-utils/resources/vm/utils/selectors';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

type UseComputeReadinessResult = {
  error: Error;
  isReady: boolean;
  loaded: boolean;
  nodesArchs: string[];
  vmsArchs: string[];
};

const useComputeReadiness = (
  vms: V1VirtualMachine[],
  targetCluster: string,
): UseComputeReadinessResult => {
  const vmsArchs = useMemo(() => Array.from(new Set(vms.map((vm) => getArchitecture(vm)))), [vms]);

  const [nodes, nodesLoaded, nodesError] = useK8sWatchData<IoK8sApiCoreV1Node[]>({
    cluster: targetCluster,
    groupVersionKind: modelToGroupVersionKind(NodeModel),
    isList: true,
  });

  const nodesArchs = useMemo(
    () =>
      Array.from(
        new Set(
          nodes
            .map((node) => node.status?.nodeInfo?.architecture)
            .filter((arch): arch is string => !!arch),
        ),
      ),
    [nodes],
  );

  const isReady = useMemo(
    () => vmsArchs.every((vmArch) => nodesArchs.includes(vmArch)),
    [vmsArchs, nodesArchs],
  );

  return {
    error: nodesError,
    isReady,
    loaded: nodesLoaded,
    nodesArchs,
    vmsArchs,
  };
};

export default useComputeReadiness;
