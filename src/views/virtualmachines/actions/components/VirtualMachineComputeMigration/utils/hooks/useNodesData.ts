import { IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useWorkerNodes from '@kubevirt-utils/resources/node/hooks/useWorkerNodes';
import { getNodeArchitecture } from '@kubevirt-utils/resources/node/utils/selectors';
import { isNodeSchedulable, nodeStatus } from '@kubevirt-utils/resources/node/utils/utils';
import { getName } from '@kubevirt-utils/resources/shared';
import useNode from '@kubevirt-utils/resources/vm/hooks/useNode';
import { getArchitecture } from '@kubevirt-utils/resources/vm/utils/selectors';
import { getCluster } from '@multicluster/helpers/selectors';
import useNodesMetrics from '@virtualmachines/actions/components/VirtualMachineComputeMigration/utils/hooks/useNodesMetrics/useNodesMetrics';
import { NodeData } from '@virtualmachines/actions/components/VirtualMachineComputeMigration/utils/types';

type UseNodesData = (vm: V1VirtualMachine) => {
  nodes: IoK8sApiCoreV1Node[];
  nodesData: NodeData[];
  nodesDataLoaded: boolean;
  vmArch: string;
};

const useNodesData: UseNodesData = (vm) => {
  const cluster = getCluster(vm);
  const [nodes, nodesLoaded] = useWorkerNodes(cluster);
  const { metricsData } = useNodesMetrics(cluster);

  const vmiNodeName = useNode(vm);
  const currentNode = nodes?.find((node) => getName(node) === vmiNodeName);
  const vmArch = getArchitecture(vm) || getNodeArchitecture(currentNode);

  const filteredNodes = nodes?.filter((node) => {
    if (getName(node) === vmiNodeName || !isNodeSchedulable(node)) return false;
    return getNodeArchitecture(node) === vmArch;
  });

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

  return { nodes, nodesData, nodesDataLoaded: nodesLoaded, vmArch };
};

export default useNodesData;
