import React, { FC } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getName } from '@kubevirt-utils/resources/shared';
import { Stack, StackItem } from '@patternfly/react-core';

type BulkVMsPopoverProps = {
  vms: V1VirtualMachine[];
};

const BulkVMsPopover: FC<BulkVMsPopoverProps> = ({ vms }) => (
  <div>
    <Stack>
      {vms?.map((vm) => {
        const vmName = getName(vm);
        return <StackItem key={vmName}>{vmName}</StackItem>;
      })}
    </Stack>
  </div>
);

export default BulkVMsPopover;
