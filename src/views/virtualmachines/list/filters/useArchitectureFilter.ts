import { useMemo } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  type KubevirtFilter,
  KubevirtFilterLayout,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getArchitecture } from '@kubevirt-utils/resources/vm/utils/selectors';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

import { getArchitectures } from './utils';

const useArchitectureFilter = (vms: V1VirtualMachine[]): KubevirtFilter<V1VirtualMachine> => {
  const { t } = useKubevirtTranslation();

  const options = useMemo(
    () => getArchitectures(vms).map((arch) => ({ label: arch, value: arch })),
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
