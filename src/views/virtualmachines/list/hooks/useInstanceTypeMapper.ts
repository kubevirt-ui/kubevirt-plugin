import { useMemo } from 'react';

import {
  VirtualMachineClusterInstancetypeModelGroupVersionKind,
  VirtualMachineInstancetypeModelGroupVersionKind,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  type V1beta1VirtualMachineClusterInstancetype,
  type V1beta1VirtualMachineInstancetype,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getClusterKey, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { useAccessibleResources } from '@virtualmachines/search/hooks/useAccessibleResources';
import { type InstanceTypeMapper } from '@virtualmachines/utils/mappers';

export const useInstanceTypeMapper = (): {
  instanceTypeMapper: InstanceTypeMapper;
  instanceTypesLoaded: boolean;
} => {
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
    >((acc, instanceType) => {
      const cluster = getClusterKey(instanceType);
      acc[cluster] ??= {};
      acc[cluster][getName(instanceType)] = instanceType;
      return acc;
    }, {});

    const namespacedInstanceTypes = (namespacedITs ?? []).reduce<
      InstanceTypeMapper['namespacedInstanceTypes']
    >((acc, instanceType) => {
      const cluster = getClusterKey(instanceType);
      const ns = getNamespace(instanceType);
      acc[cluster] ??= {};
      acc[cluster][ns] ??= {};
      acc[cluster][ns][getName(instanceType)] = instanceType;
      return acc;
    }, {});

    return { clusterInstanceTypes, namespacedInstanceTypes };
  }, [clusterITs, namespacedITs]);

  return { instanceTypeMapper, instanceTypesLoaded: clusterITsLoaded && namespacedITsLoaded };
};
