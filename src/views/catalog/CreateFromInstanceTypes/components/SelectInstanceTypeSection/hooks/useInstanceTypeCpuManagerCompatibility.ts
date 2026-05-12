import { useMemo } from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { InstanceTypes } from '@catalog/CreateFromInstanceTypes/state/utils/types';
import { IoK8sApiCoreV1Node } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  cpuManagerLabelKey,
  cpuManagerLabelValue,
} from '@kubevirt-utils/components/DedicatedResourcesModal/utils/constants';
import { modelToGroupVersionKind, NodeModel } from '@kubevirt-utils/models';
import { getLabel, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

type UseInstanceTypeCpuManagerCompatibilityValues = [
  isIncompatible: boolean,
  loaded: boolean,
  error: any,
];

const useInstanceTypeCpuManagerCompatibility = (
  allInstanceTypes: InstanceTypes,
): UseInstanceTypeCpuManagerCompatibilityValues => {
  const cluster = useClusterParam();

  const {
    instanceTypeVMState: { selectedInstanceType },
  } = useInstanceTypeVMStore();

  const [nodes, nodesLoaded, nodesError] = useK8sWatchData<IoK8sApiCoreV1Node[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(NodeModel),
    isList: true,
  });

  const { hasCpuManagerNodes, requiresCpuManager } = useMemo(() => {
    const fullInstanceType = allInstanceTypes?.find(
      (it) =>
        getName(it) === selectedInstanceType?.name &&
        (getNamespace(it) ?? null) === (selectedInstanceType?.namespace ?? null),
    );

    return {
      hasCpuManagerNodes: Boolean(
        nodes?.some((node) => getLabel(node, cpuManagerLabelKey) === cpuManagerLabelValue),
      ),
      requiresCpuManager: fullInstanceType?.spec?.cpu?.dedicatedCPUPlacement === true,
    };
  }, [allInstanceTypes, nodes, selectedInstanceType?.name, selectedInstanceType?.namespace]);

  const isIncompatible = nodesLoaded && !nodesError && requiresCpuManager && !hasCpuManagerNodes;

  return [isIncompatible, nodesLoaded, nodesError];
};

export default useInstanceTypeCpuManagerCompatibility;
