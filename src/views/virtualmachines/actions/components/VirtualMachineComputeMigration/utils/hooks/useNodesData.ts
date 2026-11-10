import { IoK8sApiCoreV1Node } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import useSchedulableVirtNodes from '@kubevirt-utils/resources/node/hooks/useSchedulableVirtNodes';
import { getNodeArchitecture } from '@kubevirt-utils/resources/node/utils/selectors';
import { isNodeSchedulable, nodeStatus } from '@kubevirt-utils/resources/node/utils/utils';
import { getName } from '@kubevirt-utils/resources/shared';
import useVMIForVM from '@kubevirt-utils/resources/vm/hooks/useVMIForVM';
import { getVMIArchitecture, getVMINodeName } from '@kubevirt-utils/resources/vmi';
import { getCluster } from '@multicluster/helpers/selectors';
import useNodesMetrics from '@virtualmachines/actions/components/VirtualMachineComputeMigration/utils/hooks/useNodesMetrics/useNodesMetrics';
import { NodeData } from '@virtualmachines/actions/components/VirtualMachineComputeMigration/utils/types';

type UseNodesData = (vm: V1VirtualMachine) => {
  nodes: IoK8sApiCoreV1Node[];
  nodesData: NodeData[];
  nodesDataLoaded: boolean;
  vmiLoadError: Error;
};

const useNodesData: UseNodesData = (vm) => {
  const cluster = getCluster(vm);
  const [nodes, nodesLoaded] = useSchedulableVirtNodes(cluster);
  const { metricsData } = useNodesMetrics(cluster);

  const { vmi, vmiLoaded, vmiLoadError } = useVMIForVM(vm);
  const vmiNodeName = getVMINodeName(vmi);
  const vmiArch = getVMIArchitecture(vmi);

  const filteredNodes =
    vmi &&
    nodes?.filter((node) => {
      if (getName(node) === vmiNodeName || !isNodeSchedulable(node)) return false;

      return getNodeArchitecture(node) === vmiArch;
    });

  const nodesData = (filteredNodes || [])?.reduce((acc, node) => {
    const nodeName = getName(node);
    const nodeMetrics = metricsData?.[nodeName];
    const { totalCPU, totalMemory, usedCPU, usedMemory } = nodeMetrics || {};

    acc.push({
      cpuUtilization: usedCPU && totalCPU ? usedCPU / totalCPU : 0,
      memoryUtilization: usedMemory && totalMemory ? usedMemory / totalMemory : 0,
      metadata: {
        name: nodeName,
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

  return {
    nodes,
    nodesData,
    nodesDataLoaded: nodesLoaded && vmiLoaded,
    vmiLoadError,
  };
};

export default useNodesData;
