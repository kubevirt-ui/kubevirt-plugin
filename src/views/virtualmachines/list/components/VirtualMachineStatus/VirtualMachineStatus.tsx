import * as React from 'react';

import { HelperText, HelperTextItem } from '@patternfly/react-core';

import { getVMStatusIcon } from '../../../utils';

const VirtualMachineStatus: React.FC<VirtualMachinesPageStatusProps> = ({ printableStatus }) => {
  const Icon = getVMStatusIcon(printableStatus);
  return (
    <HelperText>
      <HelperTextItem icon={<Icon />}>{printableStatus}</HelperTextItem>
    </HelperText>
  );
};

type VirtualMachinesPageStatusProps = {
  printableStatus: string;
};

export default VirtualMachineStatus;
