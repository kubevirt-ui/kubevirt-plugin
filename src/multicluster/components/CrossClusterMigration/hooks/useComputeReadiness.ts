import { useMemo } from 'react';

import { IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { modelToGroupVersionKind, NodeModel } from '@kubevirt-utils/models';
import { getArchitecture } from '@kubevirt-utils/resources/vm/utils/selectors';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

const useComputeReadiness = (vms: V1VirtualMachine[], targetCluster: string) => {
  const vmsArchs = useMemo(() => Array.from(new Set(vms.map((vm) => getArchitecture(vm)))), [vms]);

  const [nodes, nodesLoaded, nodesError] = useK8sWatchData<IoK8sApiCoreV1Node[]>({
    cluster: targetCluster,
    groupVersionKind: modelToGroupVersionKind(NodeModel),
    isList: true,
  });

  const nodesArchs = useMemo(
    () => Array.from(new Set(nodes.map((node) => node.status?.nodeInfo?.architecture))),
    [nodes],
  );

  const isReady = useMemo(() => {
    return vmsArchs.every((vmArch) => nodesArchs.includes(vmArch));
  }, [vmsArchs, nodesArchs]);

  return {
    error: nodesError,
    isReady,
    loaded: nodesLoaded,
    nodesArchs,
    vmsArchs,
  };
};

export default useComputeReadiness;
