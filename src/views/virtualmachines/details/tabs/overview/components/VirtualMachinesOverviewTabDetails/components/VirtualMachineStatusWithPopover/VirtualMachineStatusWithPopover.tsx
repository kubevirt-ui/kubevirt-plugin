import React, { type FC, type ReactNode } from 'react';

import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getVMStatus } from '@kubevirt-utils/resources/shared';
import { printableVMStatus } from '@virtualmachines/utils';

import MigrationProgressPopover from './MigrationProgressPopover';
import StatusPopoverButton from './StatusPopoverButton';
import VirtualMachineOverviewStatus from './VirtualMachineOverviewStatus';
import VirtualMachineProvisioningStatus from './VirtualMachineProvisioningStatus';

type StatusWithPopoverProps = {
  children?: ReactNode;
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

const StatusWithPopover: FC<StatusWithPopoverProps> = ({ vm, vmi }) => {
  const vmPrintableStatus = getVMStatus(vm);
  const statusButton = <StatusPopoverButton vmPrintableStatus={vmPrintableStatus} />;

  // Different popovers take different props (vm vs vmi), so a status→component map
  // is not type-safe under @typescript-eslint/no-unsafe-assignment.
  if (vmPrintableStatus === printableVMStatus.Migrating) {
    return <MigrationProgressPopover vmi={vmi}>{statusButton}</MigrationProgressPopover>;
  }

  if (vmPrintableStatus === printableVMStatus.Provisioning) {
    return (
      <VirtualMachineProvisioningStatus vm={vm}>{statusButton}</VirtualMachineProvisioningStatus>
    );
  }

  return <VirtualMachineOverviewStatus vm={vm}>{statusButton}</VirtualMachineOverviewStatus>;
};

export default StatusWithPopover;
