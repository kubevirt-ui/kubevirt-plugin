import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getVirtualMachineStorageClasses, type PVCMapper } from '@virtualmachines/utils/mappers';

type StorageClassByVM = { [namespace in string]: { [name in string]: Set<string> } };

export const getVMStorageClasses = (
  vms: V1VirtualMachine[],
  pvcMapper: PVCMapper,
): { allStorageClasses: Set<string>; storageClassesByVM: StorageClassByVM } => {
  return vms?.reduce(
    (acc, vm) => {
      const vmNamespace = getNamespace(vm);
      const vmName = getName(vm);

      const storageClasses = getVirtualMachineStorageClasses(vm, pvcMapper);

      for (const storageClass of storageClasses) {
        acc.allStorageClasses.add(storageClass);
        if (isEmpty(acc.storageClassesByVM[vmNamespace])) acc.storageClassesByVM[vmNamespace] = {};

        if (isEmpty(acc.storageClassesByVM[vmNamespace][vmName]))
          acc.storageClassesByVM[vmNamespace][vmName] = new Set<string>();

        acc.storageClassesByVM[vmNamespace][vmName].add(storageClass);
      }
      return acc;
    },
    {
      allStorageClasses: new Set<string>(),
      storageClassesByVM: {} as StorageClassByVM,
    },
  );
};
