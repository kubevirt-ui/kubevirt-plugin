import React, { FCC } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import VirtualMachinesInstanceActions from '../../actions/VirtualMachinesInstanceActions';

type VMIActionsCellProps = {
  row: V1VirtualMachineInstance;
};

const VMIActionsCell: FCC<VMIActionsCellProps> = ({ row }) => (
  <div data-test="vmi-row-actions">
    <VirtualMachinesInstanceActions vmi={row} />
  </div>
);

export default VMIActionsCell;
