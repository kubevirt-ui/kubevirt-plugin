import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { VirtualMachineInstancetypeModel } from '@kubevirt-utils/models';
import { SINGLE_CLUSTER_KEY } from '@kubevirt-utils/resources/constants';
import { InstanceTypeUnion } from '@kubevirt-utils/resources/instancetype/types';
import { getClusterKey, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getInstanceTypeMatcher, getVolumes } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';

export type VMIMapper = {
  mapper: {
    [cluster in string]: { [namespace in string]: { [name in string]: V1VirtualMachineInstance } };
  };
  nodeNames: { [key: string]: { id: string; title: string } };
};

export type VMIMMapper = {
  [cluster in string]: {
    [namespace in string]: { [name in string]: V1VirtualMachineInstanceMigration };
  };
};

export const getVMIFromMapper = (VMIMapper: VMIMapper, vm: V1VirtualMachine) =>
  VMIMapper?.mapper?.[getClusterKey(vm)]?.[getNamespace(vm)]?.[getName(vm)];

export const getVMIMFromMapper = (
  VMIMMapper: VMIMMapper,
  name: string,
  namespace: string,
  cluster?: string,
) => VMIMMapper?.[cluster || SINGLE_CLUSTER_KEY]?.[namespace]?.[name];

export type InstanceTypeMapper = {
  clusterInstanceTypes: {
    [cluster: string]: { [name: string]: InstanceTypeUnion };
  };
  namespacedInstanceTypes: {
    [cluster: string]: { [namespace: string]: { [name: string]: InstanceTypeUnion } };
  };
};

export const getInstanceTypeFromMapper = (
  mapper: InstanceTypeMapper,
  vm: V1VirtualMachine,
): InstanceTypeUnion | undefined => {
  const matcher = getInstanceTypeMatcher(vm);
  if (!mapper || !matcher?.name) return undefined;

  const cluster = getClusterKey(vm);

  if (matcher.kind === VirtualMachineInstancetypeModel.kind) {
    return mapper.namespacedInstanceTypes?.[cluster]?.[getNamespace(vm)]?.[matcher.name];
  }
  return mapper.clusterInstanceTypes?.[cluster]?.[matcher.name];
};

export type PVCMapper = {
  [cluster in string]: {
    [namespace in string]: { [name in string]: IoK8sApiCoreV1PersistentVolumeClaim };
  };
};

export const convertIntoPVCMapper = (pvcs: IoK8sApiCoreV1PersistentVolumeClaim[]): PVCMapper => {
  return (pvcs || []).reduce((acc, pvc) => {
    const cluster = getClusterKey(pvc);
    const namespace = getNamespace(pvc);

    if (isEmpty(acc[cluster])) acc[cluster] = {};

    if (isEmpty(acc[cluster][namespace])) acc[cluster][namespace] = {};

    acc[cluster][namespace][getName(pvc)] = pvc;
    return acc;
  }, {} as PVCMapper);
};

export const getVirtualMachineStorageClasses = (vm: V1VirtualMachine, pvcMapper: PVCMapper) => {
  const cluster = getClusterKey(vm);
  const storageClassesSet = (getVolumes(vm) || []).reduce((acc, volume) => {
    const volumePVC =
      pvcMapper?.[cluster]?.[getNamespace(vm)]?.[
        volume.dataVolume?.name || volume.persistentVolumeClaim?.claimName
      ];

    if (volumePVC) acc.add(volumePVC.spec.storageClassName);
    return acc;
  }, new Set<string>());

  return Array.from(storageClassesSet).sort();
};
