import { TFunction } from 'i18next';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  KubevirtFilter,
  KubevirtFilterLayout,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { getVMIIPAddresses } from '@kubevirt-utils/resources/vmi';
import { compareCIDR, VirtualMachineRowFilterType } from '@virtualmachines/utils';
import { getVMIFromMapper, VMIMapper } from '@virtualmachines/utils/mappers';

export const getIPFilter = (
  t: TFunction,
  vmiMapper: VMIMapper,
): KubevirtFilter<V1VirtualMachine> => ({
  categoryLabel: t('IP Address'),
  filterLayout: KubevirtFilterLayout.HIDDEN,
  id: VirtualMachineRowFilterType.IP,
  match: (obj, selected) => {
    const search = selected[0];
    if (!search) return true;

    const vmi = getVMIFromMapper(vmiMapper, obj);
    const ipAddresses = getVMIIPAddresses(vmi);
    return search.includes('/')
      ? ipAddresses.some((ipAddress) => compareCIDR(search, ipAddress))
      : ipAddresses.some((ipAddress) => ipAddress?.includes(search));
  },
});
