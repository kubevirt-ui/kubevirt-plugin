import { TFunction } from 'i18next';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getVMStatus } from '@kubevirt-utils/resources/shared';
import { VM_STATUS } from '@kubevirt-utils/resources/vm/utils/vmStatus';
import { isVMGuestAgentConnected } from '@kubevirt-utils/resources/vmi/utils/guest-agent';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

export enum GuestAgentStatus {
  NotReporting = 'notReporting',
  Reporting = 'reporting',
}

const matchesGuestAgentStatus = (vm: V1VirtualMachine, status: string): boolean => {
  const isRunning = getVMStatus(vm) === VM_STATUS.Running;
  if (!isRunning) return false;

  const hasAgent = isVMGuestAgentConnected(vm);
  switch (status) {
    case GuestAgentStatus.NotReporting:
      return !hasAgent;
    case GuestAgentStatus.Reporting:
      return hasAgent;
    default:
      return false;
  }
};

export const getGuestAgentFilter = (t: TFunction): RowFilter<V1VirtualMachine> => ({
  filter: (input, vm) => {
    if (isEmpty(input.selected)) return true;
    return input.selected.some((s) => matchesGuestAgentStatus(vm, s));
  },
  filterGroupName: t('Guest agent'),
  isMatch: (vm, filterValue) => matchesGuestAgentStatus(vm, filterValue),
  items: [
    { id: GuestAgentStatus.NotReporting, title: t('Not reporting') },
    { id: GuestAgentStatus.Reporting, title: t('Reporting') },
  ],
  type: VirtualMachineRowFilterType.GuestAgent,
});
