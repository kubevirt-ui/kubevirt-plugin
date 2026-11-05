import { type IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useSchedulableVirtNodes from '@kubevirt-utils/resources/node/hooks/useSchedulableVirtNodes';
import { getNodeArchitecture } from '@kubevirt-utils/resources/node/utils/selectors';
import { NodeStatus } from '@kubevirt-utils/resources/node/utils/types';
import {
  isNodeReady,
  isNodeSchedulable,
  nodeMatchesNodeSelector,
} from '@kubevirt-utils/resources/node/utils/utils';
import { getName } from '@kubevirt-utils/resources/shared';
import useVMIForVM from '@kubevirt-utils/resources/vm/hooks/useVMIForVM';
import {
  getVMIArchitecture,
  getVMINodeName,
  getVMINodeSelector,
} from '@kubevirt-utils/resources/vmi';
import { getCluster } from '@multicluster/helpers/selectors';
import useNodesMetrics from '@virtualmachines/actions/components/VirtualMachineComputeMigration/utils/hooks/useNodesMetrics/useNodesMetrics';
import { type NodeData } from '@virtualmachines/actions/components/VirtualMachineComputeMigration/utils/types';

type UseNodesData = (vm: V1VirtualMachine) => {
  nodes: IoK8sApiCoreV1Node[];
  nodesData: NodeData[];
  nodesDataLoaded: boolean;
  vmArch: string | undefined;
  vmiLoadError: Error;
  vmiMissing: boolean;
};

const useNodesData: UseNodesData = (vm) => {
  const cluster = getCluster(vm);
  const [nodes, nodesLoaded] = useSchedulableVirtNodes(cluster);
  const { metricsData } = useNodesMetrics(cluster);

  const { vmi, vmiLoaded, vmiLoadError } = useVMIForVM(vm);
  const vmiNodeName = getVMINodeName(vmi);
  const vmiNodeSelector = getVMINodeSelector(vmi);
  const vmiArch = getVMIArchitecture(vmi);

  const filteredNodes =
    vmi &&
    nodes?.filter((node) => {
      if (
        getName(node) === vmiNodeName ||
        !isNodeSchedulable(node) ||
        !nodeMatchesNodeSelector(node, vmiNodeSelector)
      ) {
        return false;
      }

      return getNodeArchitecture(node) === vmiArch;
    });

  const nodesData = (filteredNodes ?? []).reduce<NodeData[]>((acc, node) => {
    const nodeName = getName(node);
    const nodeMetrics = nodeName ? metricsData[nodeName] : undefined;
    const totalCPU = nodeMetrics?.totalCPU;
    const totalMemory = nodeMetrics?.totalMemory;
    const usedCPU = nodeMetrics?.usedCPU;
    const usedMemory = nodeMetrics?.usedMemory;

    const nodeData: NodeData = {
      metadata: {
        name: nodeName,
      },
      name: nodeName,
      status: isNodeReady(node) ? NodeStatus.READY : NodeStatus.NOT_READY,
    };

    if (usedCPU && totalCPU) {
      nodeData.cpuUtilization = String(usedCPU / totalCPU);
    }
    if (usedMemory && totalMemory) {
      nodeData.memoryUtilization = String(usedMemory / totalMemory);
    }
    if (totalCPU != null) {
      nodeData.totalCPU = totalCPU;
    }
    if (totalMemory != null) {
      nodeData.totalMemory = totalMemory;
    }
    if (usedCPU != null) {
      nodeData.usedCPU = String(usedCPU);
    }
    if (usedMemory != null) {
      nodeData.usedMemory = usedMemory;
    }

    acc.push(nodeData);
    return acc;
  }, []);

  return {
    nodes,
    nodesData,
    nodesDataLoaded: nodesLoaded && vmiLoaded,
    vmArch: vmiArch,
    vmiLoadError,
    vmiMissing: vmiLoaded && !vmi && !vmiLoadError,
  };
};

export default useNodesData;
