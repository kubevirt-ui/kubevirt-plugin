import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { HelperText, HelperTextItem, Stack, StackItem } from '@patternfly/react-core';

import { getVMStatusIcon } from '../../../utils';
import VMNotMigratableLabel from '../VMNotMigratableLabel/VMNotMigratableLabel';

type VirtualMachinesPageStatusProps = {
  vm: V1VirtualMachine;
};

const VirtualMachineStatus: FC<VirtualMachinesPageStatusProps> = ({ vm }) => {
  const printableStatus = vm?.status?.printableStatus;
  const Icon = getVMStatusIcon(printableStatus);

  return (
    <Stack>
      <StackItem className="pf-u-mb-xs">
        <HelperText>
          <HelperTextItem icon={<Icon />}>{printableStatus}</HelperTextItem>
        </HelperText>
      </StackItem>
      <VMNotMigratableLabel vm={vm} />
    </Stack>
  );
};

export default VirtualMachineStatus;
