import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import {
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getName, getNamespace, NamespacedResourceMap } from '@kubevirt-utils/resources/shared';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { isEmpty } from '@kubevirt-utils/utils/utils';

export type VMIMapper = {
  mapper: NamespacedResourceMap<V1VirtualMachineInstance>;
  nodeNames: { [key: string]: { id: string; title: string } };
};

export type VMIMMapper = NamespacedResourceMap<V1VirtualMachineInstanceMigration>;

export const getVMIFromMapper = (VMIMapper: VMIMapper, vm: V1VirtualMachine) =>
  VMIMapper?.mapper?.[getNamespace(vm)]?.[getName(vm)];

export const getVMIMFromMapper = (VMIMMapper: VMIMMapper, name: string, namespace: string) =>
  VMIMMapper?.mapper?.[namespace]?.[name];

export type PVCMapper = {
  [namespace in string]: { [name in string]: IoK8sApiCoreV1PersistentVolumeClaim };
};

export const convertIntoPVCMapper = (pvcs: IoK8sApiCoreV1PersistentVolumeClaim[]): PVCMapper => {
  return (pvcs || []).reduce((acc, pvc) => {
    const namespace = getNamespace(pvc);

    if (isEmpty(acc[namespace])) acc[namespace] = {};

    acc[namespace][getName(pvc)] = pvc;
    return acc;
  }, {} as PVCMapper);
};

export const getVirtualMachineStorageClasses = (vm: V1VirtualMachine, pvcMapper: PVCMapper) => {
  const storageClassesSet = (getVolumes(vm) || []).reduce((acc, volume) => {
    const volumePVC =
      pvcMapper?.[getNamespace(vm)]?.[
        volume.dataVolume?.name || volume.persistentVolumeClaim?.claimName
      ];

    if (volumePVC) acc.add(volumePVC.spec.storageClassName);
    return acc;
  }, new Set<string>());

  return Array.from(storageClassesSet).sort();
};
