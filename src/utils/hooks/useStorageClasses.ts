import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getVirtualMachineStorageClasses, PVCMapper } from '@virtualmachines/utils/mappers';

type StorageClassByVM = { [namespace in string]: { [name in string]: Set<string> } };

export const useStorageClasses = (vms: V1VirtualMachine[], pvcMapper: PVCMapper) => {
  return vms?.reduce(
    (acc, vm) => {
      const vmNamespace = getNamespace(vm);
      const vmName = getName(vm);

      const storageClasses = getVirtualMachineStorageClasses(vm, pvcMapper);

      storageClasses.forEach((storageClass) => {
        acc.allStorageClasses.add(storageClass);
        if (isEmpty(acc.storageClassesByVM[vmNamespace])) acc.storageClassesByVM[vmNamespace] = {};

        if (isEmpty(acc.storageClassesByVM[vmNamespace][vmName]))
          acc.storageClassesByVM[vmNamespace][vmName] = new Set<string>();

        acc.storageClassesByVM[vmNamespace][vmName].add(storageClass);
      });
      return acc;
    },
    {
      allStorageClasses: new Set<string>(),
      storageClassesByVM: {} as StorageClassByVM,
    },
  );
};
