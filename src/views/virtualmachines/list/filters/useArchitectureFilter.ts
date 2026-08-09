import { useMemo } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  type KubevirtFilter,
  KubevirtFilterLayout,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getArchitecture } from '@kubevirt-utils/resources/vm/utils/selectors';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

const useArchitectureFilter = (vms: V1VirtualMachine[]): KubevirtFilter<V1VirtualMachine> => {
  const { t } = useKubevirtTranslation();

  const options = useMemo(
    () =>
      Array.from(
        vms?.reduce((acc, vm) => {
          const arch = getArchitecture(vm);
          if (arch) acc.add(arch);
          return acc;
        }, new Set<string>()) ?? [],
      )
        .sort((a, b) => a.localeCompare(b))
        .map((arch) => ({ label: arch, value: arch })),
    [vms],
  );

  return useMemo(
    () => ({
      categoryLabel: t('Architecture type'),
      filterLayout: KubevirtFilterLayout.HIDDEN,
      id: VirtualMachineRowFilterType.Architecture,
      match: (obj, selected) => selected.includes(getArchitecture(obj)),
      options,
    }),
    [t, options],
  );
};

export default useArchitectureFilter;
