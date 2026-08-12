import { useMemo } from 'react';

import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  type KubevirtFilter,
  KubevirtFilterLayout,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getVMStorageClasses } from '@kubevirt-utils/resources/vm/utils/getVMStorageClasses';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';
import type { PVCMapper } from '@virtualmachines/utils/mappers';

const useStorageClassFilter = (
  vms: V1VirtualMachine[],
  pvcMapper: PVCMapper,
): KubevirtFilter<V1VirtualMachine> => {
  const { t } = useKubevirtTranslation();
  const { allStorageClasses, storageClassesByVM } = getVMStorageClasses(vms, pvcMapper);

  const options = useMemo(
    () =>
      Array.from(allStorageClasses)
        .sort((a, b) => a.localeCompare(b))
        .map((storageClass) => ({ label: storageClass, value: storageClass })),
    [allStorageClasses],
  );

  return useMemo(
    () => ({
      categoryLabel: t('Storage class'),
      filterLayout: KubevirtFilterLayout.SELECT,
      id: VirtualMachineRowFilterType.StorageClass,
      match: (obj: V1VirtualMachine, selected: string[]) =>
        selected.some((storageClass) =>
          storageClassesByVM?.[getNamespace(obj)]?.[getName(obj)]?.has(storageClass),
        ),
      options,
    }),
    [t, options, storageClassesByVM],
  );
};

export default useStorageClassFilter;
