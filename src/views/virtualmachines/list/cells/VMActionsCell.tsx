import React, { FC } from 'react';

import VirtualMachineActions from '@virtualmachines/actions/components/VirtualMachineActions/VirtualMachineActions';
import useVirtualMachineActionsProvider from '@virtualmachines/actions/hooks/useVirtualMachineActionsProvider';

import { VMCellWithCallbacksProps } from './types';

const VMActionsCell: FC<VMCellWithCallbacksProps> = ({ callbacks, row }) => {
  const vmim = callbacks.getVmim(row);
  const [actions] = useVirtualMachineActionsProvider(row, vmim);

  return (
    <VirtualMachineActions actions={actions} data-test="vm-row-actions" isKebabToggle vm={row} />
  );
};

export default VMActionsCell;
