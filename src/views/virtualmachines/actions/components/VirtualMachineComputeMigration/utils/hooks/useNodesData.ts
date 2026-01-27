import { modelToGroupVersionKind, NodeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { isNodeSchedulable, nodeStatus } from '@kubevirt-utils/resources/node/utils/utils';
import { getName } from '@kubevirt-utils/resources/shared';
import useNode from '@kubevirt-utils/resources/vm/hooks/useNode';
import { getCluster } from '@multicluster/helpers/selectors';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import useNodesMetrics from '@virtualmachines/actions/components/VirtualMachineComputeMigration/utils/hooks/useNodesMetrics/useNodesMetrics';
import { NodeData } from '@virtualmachines/actions/components/VirtualMachineComputeMigration/utils/types';

type UseNodesData = (vm: V1VirtualMachine) => {
  nodes: IoK8sApiCoreV1Node[];
  nodesData: NodeData[];
  nodesDataLoaded: boolean;
};

const useNodesData: UseNodesData = (vm) => {
  const cluster = getCluster(vm);
  const [nodes, nodesLoaded] = useK8sWatchData<IoK8sApiCoreV1Node[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(NodeModel),
    isList: true,
    selector: {
      matchLabels: { 'node-role.kubernetes.io/worker': '' },
    },
  });
  const { metricsData } = useNodesMetrics(cluster);
  const vmiNodeName = useNode(vm);

  const filteredNodes = nodes?.filter(
    (node) => getName(node) !== vmiNodeName && isNodeSchedulable(node),
  );

  const nodesData = (filteredNodes || [])?.reduce((acc, node) => {
    const nodeName = getName(node);
    const nodeMetrics = metricsData?.[nodeName];
    const { totalCPU, totalMemory, usedCPU, usedMemory } = nodeMetrics || {};

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

  return { nodes, nodesData, nodesDataLoaded: nodesLoaded };
};

export default useNodesData;
