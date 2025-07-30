import { modelToGroupVersionKind, NodeModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { nodeStatus } from '@kubevirt-utils/resources/node/utils/utils';
import { getName } from '@kubevirt-utils/resources/shared';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import useNodesMetrics from '@virtualmachines/actions/components/VirtualMachineComputeMigration/utils/hooks/useNodesMetrics/useNodesMetrics';
import { NodeData } from '@virtualmachines/actions/components/VirtualMachineComputeMigration/utils/types';

type UseNodesData = () => {
  nodes: IoK8sApiCoreV1Node[];
  nodesData: NodeData[];
  nodesDataLoaded: boolean;
};

const useNodesData: UseNodesData = () => {
  const [nodes, nodesLoaded] = useK8sWatchResource<IoK8sApiCoreV1Node[]>({
    groupVersionKind: modelToGroupVersionKind(NodeModel),
    isList: true,
  });
  const { metricsData, metricsLoaded } = useNodesMetrics();

  const nodesData = (nodes || [])?.reduce((acc, node) => {
    const nodeName = getName(node);
    const nodeMetrics = metricsData?.[nodeName];
    const { totalCPU, totalMemory, usedCPU, usedMemory } = nodeMetrics;

    acc.push({
      cpuUtilization: usedCPU && totalCPU ? usedCPU / totalCPU : 0,
      memoryUtilization: usedMemory && totalMemory ? usedMemory / totalMemory : 0,
      metadata: {
        name: getName(node),
      },
      name: nodeName,
      status: nodeStatus(node),
      totalCPU,
      totalMemory,
      usedCPU,
      usedMemory,
    });
    return acc;
  }, []);

  return { nodes, nodesData, nodesDataLoaded: nodesLoaded && metricsLoaded };
};

export default useNodesData;
