import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import {
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { SINGLE_CLUSTER_KEY } from '@kubevirt-utils/resources/constants';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';

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
  VMIMapper?.mapper?.[getCluster(vm) || SINGLE_CLUSTER_KEY]?.[getNamespace(vm)]?.[getName(vm)];

export const getVMIMFromMapper = (
  VMIMMapper: VMIMMapper,
  name: string,
  namespace: string,
  cluster?: string,
) => VMIMMapper?.[cluster || SINGLE_CLUSTER_KEY]?.[namespace]?.[name];

export type PVCMapper = {
  [cluster in string]: {
    [namespace in string]: { [name in string]: IoK8sApiCoreV1PersistentVolumeClaim };
  };
};

export const convertIntoPVCMapper = (pvcs: IoK8sApiCoreV1PersistentVolumeClaim[]): PVCMapper => {
  return (pvcs || []).reduce((acc, pvc) => {
    const cluster = getCluster(pvc) || SINGLE_CLUSTER_KEY;
    const namespace = getNamespace(pvc);

    if (isEmpty(acc[cluster])) acc[cluster] = {};

    if (isEmpty(acc[cluster][namespace])) acc[cluster][namespace] = {};

    acc[cluster][namespace][getName(pvc)] = pvc;
    return acc;
  }, {} as PVCMapper);
};

export const getVirtualMachineStorageClasses = (vm: V1VirtualMachine, pvcMapper: PVCMapper) => {
  const cluster = getCluster(vm) || SINGLE_CLUSTER_KEY;
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
