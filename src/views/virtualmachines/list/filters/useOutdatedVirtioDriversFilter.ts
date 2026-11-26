import { useMemo } from 'react';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  type KubevirtFilter,
  KubevirtFilterLayout,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useOutdatedVirtioDrivers from '@kubevirt-utils/resources/vm/utils/virtio-drivers/useOutdatedVirtioDrivers';
import { hasOutdatedVirtioDrivers } from '@kubevirt-utils/resources/vm/utils/virtio-drivers/utils';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

const useOutdatedVirtioDriversFilter = (): KubevirtFilter<V1VirtualMachine> => {
  const { t } = useKubevirtTranslation();
  const { outdatedVmKeys } = useOutdatedVirtioDrivers();

  return useMemo(
    () => ({
      filterLayout: KubevirtFilterLayout.HIDDEN,
      id: VirtualMachineRowFilterType.OutdatedVirtioDrivers,
      match: (obj, selected) =>
        selected.includes('true') && hasOutdatedVirtioDrivers(obj, outdatedVmKeys),
      options: [{ label: t('Outdated VirtIO drivers'), value: 'true' }],
    }),
    [outdatedVmKeys, t],
  );
};

export default useOutdatedVirtioDriversFilter;
