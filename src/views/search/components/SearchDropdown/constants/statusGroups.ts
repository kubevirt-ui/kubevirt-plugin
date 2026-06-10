import { ERROR_STATUS } from '@kubevirt-utils/resources/vm';
import { printableVMStatus, VirtualMachineRowFilterType } from '@virtualmachines/utils';

export const STATUS_VALUE_GROUPS = [
  [
    printableVMStatus.Running,
    printableVMStatus.Migrating,
    printableVMStatus.Paused,
    printableVMStatus.Stopped,
    ERROR_STATUS,
    printableVMStatus.Unknown,
  ],
  [
    printableVMStatus.Starting,
    printableVMStatus.Provisioning,
    printableVMStatus.WaitingForVolumeBinding,
    printableVMStatus.WaitingForReceiver,
  ],
  [printableVMStatus.Stopping, printableVMStatus.Deleting, printableVMStatus.Terminating],
];

export const GROUPED_FILTER_KEYS = new Set<string>([VirtualMachineRowFilterType.Status]);
