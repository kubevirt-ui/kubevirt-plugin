import React, { FC } from 'react';

import { printableVMStatus } from '@virtualmachines/utils';

import VirtualMachineMigrationPercentage from '../../details/tabs/overview/components/VirtualMachinesOverviewTabDetails/components/VirtualMachineMigrationPercentage';
import StatusWithPopover from '../../details/tabs/overview/components/VirtualMachinesOverviewTabDetails/components/VirtualMachineStatusWithPopover/VirtualMachineStatusWithPopover';

import { VMCellWithCallbacksProps } from './types';

const VMStatusCell: FC<VMCellWithCallbacksProps> = ({ callbacks, row }) => {
  const vmi = callbacks.getVmi(row);

  return (
    <>
      <StatusWithPopover vm={row} vmi={vmi} />
      {row?.status?.printableStatus === printableVMStatus.Migrating && (
        <VirtualMachineMigrationPercentage vm={row} />
      )}
    </>
  );
};

export default VMStatusCell;
