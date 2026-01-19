import { useMemo } from 'react';

import { VirtualMachineInstanceModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { SINGLE_CLUSTER_KEY } from '@kubevirt-utils/resources/constants';
import { getCluster } from '@multicluster/helpers/selectors';
import { useAccessibleResources } from '@virtualmachines/search/hooks/useAccessibleResources';
import { VMIMapper } from '@virtualmachines/utils/mappers';

export const useVirtualMachineInstanceMapper = () => {
  const { loaded: vmisLoaded, resources: vmis } = useAccessibleResources<V1VirtualMachineInstance>(
    VirtualMachineInstanceModelGroupVersionKind,
  );

  const vmiMapper: VMIMapper = useMemo(() => {
    return (Array.isArray(vmis) ? vmis : [])?.reduce(
      (acc, vmi) => {
        const name = vmi?.metadata?.name;
        const namespace = vmi?.metadata?.namespace;
        const cluster = getCluster(vmi) || SINGLE_CLUSTER_KEY;
        if (!acc.mapper[cluster]) {
          acc.mapper[cluster] = {};
        }
        if (!acc.mapper[cluster][namespace]) {
          acc.mapper[cluster][namespace] = {};
        }
        acc.mapper[cluster][namespace][name] = vmi;
        const nodeName = vmi?.status?.nodeName;
        if (nodeName && !acc?.nodeNames?.[nodeName]) {
          acc.nodeNames[nodeName] = {
            id: nodeName,
            title: nodeName,
          };
        }
        return acc;
      },
      { mapper: {}, nodeNames: {} },
    );
  }, [vmis]);

  return { vmiMapper, vmisLoaded };
};
