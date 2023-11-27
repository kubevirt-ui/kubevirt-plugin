import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { HelperText, HelperTextItem, Split, SplitItem } from '@patternfly/react-core';

import { getVMStatusIcon } from '../../../utils';
import VMNotMigratableLabel from '../VMNotMigratableLabel/VMNotMigratableLabel';

type VirtualMachinesPageStatusProps = {
  vm: V1VirtualMachine;
};

const VirtualMachineStatus: React.FC<VirtualMachinesPageStatusProps> = ({ vm }) => {
  const printableStatus = vm?.status?.printableStatus;
  const Icon = getVMStatusIcon(printableStatus);

  return (
    <Split hasGutter>
      <SplitItem>
        <HelperText>
          <HelperTextItem icon={<Icon />}>{printableStatus}</HelperTextItem>
        </HelperText>
      </SplitItem>
      <VMNotMigratableLabel vm={vm} />
    </Split>
  );
};

export default VirtualMachineStatus;
