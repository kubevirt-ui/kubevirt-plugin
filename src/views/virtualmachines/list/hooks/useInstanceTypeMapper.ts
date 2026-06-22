import { useMemo } from 'react';

import {
  VirtualMachineClusterInstancetypeModelGroupVersionKind,
  VirtualMachineInstancetypeModelGroupVersionKind,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  V1beta1VirtualMachineClusterInstancetype,
  V1beta1VirtualMachineInstancetype,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getClusterKey, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { useAccessibleResources } from '@virtualmachines/search/hooks/useAccessibleResources';
import { InstanceTypeMapper } from '@virtualmachines/utils/mappers';

export const useInstanceTypeMapper = () => {
  const { loaded: clusterITsLoaded, resources: clusterITs } =
    useAccessibleResources<V1beta1VirtualMachineClusterInstancetype>({
      groupVersionKind: VirtualMachineClusterInstancetypeModelGroupVersionKind,
    });

  const { loaded: namespacedITsLoaded, resources: namespacedITs } =
    useAccessibleResources<V1beta1VirtualMachineInstancetype>({
      groupVersionKind: VirtualMachineInstancetypeModelGroupVersionKind,
    });

  const instanceTypeMapper: InstanceTypeMapper = useMemo(() => {
    const clusterInstanceTypes = (clusterITs ?? []).reduce<
      InstanceTypeMapper['clusterInstanceTypes']
    >((acc, it) => {
      const cluster = getClusterKey(it);
      if (!acc[cluster]) acc[cluster] = {};
      acc[cluster][getName(it)] = it;
      return acc;
    }, {});

    const namespacedInstanceTypes = (namespacedITs ?? []).reduce<
      InstanceTypeMapper['namespacedInstanceTypes']
    >((acc, it) => {
      const cluster = getClusterKey(it);
      const ns = getNamespace(it);
      if (!acc[cluster]) acc[cluster] = {};
      if (!acc[cluster][ns]) acc[cluster][ns] = {};
      acc[cluster][ns][getName(it)] = it;
      return acc;
    }, {});

    return { clusterInstanceTypes, namespacedInstanceTypes };
  }, [clusterITs, namespacedITs]);

  return { instanceTypeMapper, instanceTypesLoaded: clusterITsLoaded && namespacedITsLoaded };
};
