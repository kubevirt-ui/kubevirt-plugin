import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useStorageClasses } from '@kubevirt-utils/hooks/useStorageClasses';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';
import { PVCMapper } from '@virtualmachines/utils/mappers';

export const useStorageClassFilter = (
  vms: V1VirtualMachine[],
  pvcMapper: PVCMapper,
): RowFilter<V1VirtualMachine> => {
  const { allStorageClasses, storageClassesByVM } = useStorageClasses(vms, pvcMapper);

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
    type: VirtualMachineRowFilterType.StorageClass,
  };
};
