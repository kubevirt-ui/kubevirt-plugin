import { useMemo } from 'react';

import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type KubevirtFilter } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { toGrouped } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getGuestAgentFilter } from '@virtualmachines/list/filters/getGuestAgentFilter';
import { getHWDevicesFilter } from '@virtualmachines/list/filters/getHWDevicesFilter';
import { getOSFilter } from '@virtualmachines/list/filters/getOSFilter';
import { getSchedulingFilter } from '@virtualmachines/list/filters/getSchedulingFilter';
import { getStatusFilter } from '@virtualmachines/list/filters/getStatusFilter';
import useArchitectureFilter from '@virtualmachines/list/filters/useArchitectureFilter';
import useNodeFilter from '@virtualmachines/list/filters/useNodeFilter';
import useStorageClassFilter from '@virtualmachines/list/filters/useStorageClassFilter';
import type { PVCMapper, VMIMapper } from '@virtualmachines/utils/mappers';

export const useCloneSourceVMFilters = (
  vms: V1VirtualMachine[],
  vmiMapper: VMIMapper,
  pvcMapper: PVCMapper,
): KubevirtFilter<V1VirtualMachine>[] => {
  const { t } = useKubevirtTranslation();

  const storageClassFilter = useStorageClassFilter(vms, pvcMapper);
  const nodeFilter = useNodeFilter(vmiMapper);
  const architectureFilter = useArchitectureFilter(vms);

  return useMemo(
    () =>
      [
        getStatusFilter(t),
        getOSFilter(t),
        storageClassFilter,
        getHWDevicesFilter(t),
        getSchedulingFilter(t),
        nodeFilter,
        getGuestAgentFilter(t),
        architectureFilter,
      ].map(toGrouped),
    [t, storageClassFilter, nodeFilter, architectureFilter],
  );
};
