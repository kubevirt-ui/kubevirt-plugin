import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName, getVMStatus } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';

type VMStatusCellProps = {
  row: V1VirtualMachine;
};

const VMStatusCell: FC<VMStatusCellProps> = ({ row }) => {
  const status = getVMStatus(row);

  return <span data-test={`vm-status-${getName(row)}`}>{status ?? NO_DATA_DASH}</span>;
};

export default VMStatusCell;
