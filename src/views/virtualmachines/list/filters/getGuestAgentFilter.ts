import { type TFunction } from 'i18next';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  type KubevirtFilter,
  KubevirtFilterLayout,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { getVMStatus } from '@kubevirt-utils/resources/shared';
import { VM_STATUS } from '@kubevirt-utils/resources/vm/utils/vmStatus';
import { isVMGuestAgentConnected } from '@kubevirt-utils/resources/vmi/utils/guest-agent';
import { GuestAgentStatus } from '@search/utils/constants';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

const matchesGuestAgentStatus = (vm: V1VirtualMachine, status: string): boolean => {
  const isRunning = getVMStatus(vm) === VM_STATUS.Running;
  if (!isRunning) return false;

  const hasAgent = isVMGuestAgentConnected(vm);
  switch (status) {
    case GuestAgentStatus.NOT_REPORTING:
      return !hasAgent;
    case GuestAgentStatus.REPORTING:
      return hasAgent;
    default:
      return false;
  }
};

export const getGuestAgentFilter = (t: TFunction): KubevirtFilter<V1VirtualMachine> => ({
  categoryLabel: t('Guest agent'),
  filterLayout: KubevirtFilterLayout.SELECT,
  id: VirtualMachineRowFilterType.GuestAgent,
  match: (obj, selected) => selected.some((status) => matchesGuestAgentStatus(obj, status)),
  options: [
    { label: t('Not reporting'), value: GuestAgentStatus.NOT_REPORTING },
    { label: t('Reporting'), value: GuestAgentStatus.REPORTING },
  ],
});
