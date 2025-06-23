import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';
import { getVirtualMachineStorageClasses, PVCMapper } from '@virtualmachines/utils/mappers';

type StorageClassByVM = { [namespace in string]: { [name in string]: Set<string> } };

export const useStorageClassFilter = (
  vms: V1VirtualMachine[],
  pvcMapper: PVCMapper,
): RowFilter<V1VirtualMachine> => {
  const { allStorageClasses, storageClassesByVM } = vms?.reduce(
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

  return {
    filter: (input, obj) => {
      const selectedStorageClasses = input.selected;

      if (isEmpty(selectedStorageClasses)) return true;

      return selectedStorageClasses.some((selectedStorageClass) =>
        storageClassesByVM?.[getNamespace(obj)]?.[getName(obj)]?.has(selectedStorageClass),
      );
    },
    filterGroupName: t('Storage class'),
    isMatch: (obj, id) => storageClassesByVM?.[getNamespace(obj)]?.[getName(obj)]?.has(id),
    items:
      Array.from(allStorageClasses)?.map((storageClassName) => ({
        id: storageClassName,
        title: storageClassName,
      })) || [],
    type: VirtualMachineRowFilterType.StorageClassName,
  };
};
