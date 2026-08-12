import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getVMStorageClasses } from '@kubevirt-utils/resources/vm/utils/getVMStorageClasses';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import type { RowFilter, RowFilterItem } from '@openshift-console/dynamic-plugin-sdk';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';
import type { PVCMapper } from '@virtualmachines/utils/mappers';

export const useStorageClassFilter = (
  vms: V1VirtualMachine[],
  pvcMapper: PVCMapper,
): RowFilter<V1VirtualMachine> => {
  const { t } = useKubevirtTranslation();
  const { allStorageClasses, storageClassesByVM } = getVMStorageClasses(vms, pvcMapper);

  return {
    filter: (input, obj): boolean => {
      const selectedStorageClasses = input.selected;

      if (isEmpty(selectedStorageClasses)) return true;

      return selectedStorageClasses.some((selectedStorageClass) =>
        storageClassesByVM?.[getNamespace(obj)]?.[getName(obj)]?.has(selectedStorageClass),
      );
    },
    filterGroupName: t('Storage class'),
    isMatch: (obj, id) => storageClassesByVM?.[getNamespace(obj)]?.[getName(obj)]?.has(id),
    items:
      Array.from(allStorageClasses)?.map<RowFilterItem>((storageClassName) => ({
        id: storageClassName,
        title: storageClassName,
      })) || [],
    type: VirtualMachineRowFilterType.StorageClass,
  };
};
