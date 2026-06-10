import { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  KubevirtFilter,
  KubevirtFilterLayout,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useStorageClasses } from '@kubevirt-utils/hooks/useStorageClasses';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';
import { PVCMapper } from '@virtualmachines/utils/mappers';

const useStorageClassFilter = (
  vms: V1VirtualMachine[],
  pvcMapper: PVCMapper,
): KubevirtFilter<V1VirtualMachine> => {
  const { t } = useKubevirtTranslation();
  const { allStorageClasses, storageClassesByVM } = useStorageClasses(vms, pvcMapper);

  const options = useMemo(
    () =>
      Array.from(allStorageClasses)
        .sort()
        .map((sc) => ({ label: sc, value: sc })),
    [allStorageClasses],
  );

  return useMemo(
    () => ({
      categoryLabel: t('Storage class'),
      filterLayout: KubevirtFilterLayout.SELECT,
      id: VirtualMachineRowFilterType.StorageClass,
      match: (obj: V1VirtualMachine, selected: string[]) =>
        selected.some((sc) => storageClassesByVM?.[getNamespace(obj)]?.[getName(obj)]?.has(sc)),
      options,
    }),
    [t, options, storageClassesByVM],
  );
};

export default useStorageClassFilter;
