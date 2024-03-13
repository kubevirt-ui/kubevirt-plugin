import React, { FC } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getVMStatus } from '@kubevirt-utils/resources/shared';
import { printableVMStatus } from '@virtualmachines/utils';

import MigrationProgressPopover from './MigrationProgressPopover';
import StatusPopoverButton from './StatusPopoverButton';
import VirtualMachineOverviewStatus from './VirtualMachineOverviewStatus';
import VirtualMachineProvisioningStatus from './VirtualMachineProvisioningStatus';

const Popovers = {
  [printableVMStatus.Migrating]: MigrationProgressPopover,
  [printableVMStatus.Provisioning]: VirtualMachineProvisioningStatus,
};

type StatusWithPopoverProps = {
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const StatusWithPopover: FC<StatusWithPopoverProps> = ({ vm, vmi }) => {
  const vmPrintableStatus = getVMStatus(vm);

  const Popover: FC<StatusWithPopoverProps> =
    Popovers[vmPrintableStatus] || VirtualMachineOverviewStatus;

  return (
    <Popover vm={vm} vmi={vmi}>
      <StatusPopoverButton vmPrintableStatus={vmPrintableStatus} />
    </Popover>
  );
};

export default StatusWithPopover;
