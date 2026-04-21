import React, { FC } from 'react';

import { Button, ButtonVariant } from '@patternfly/react-core';
import { getVMStatusIcon } from '@virtualmachines/utils';

type StatusPopoverButtonProps = {
  vmPrintableStatus: string;
};

const StatusPopoverButton: FC<StatusPopoverButtonProps> = ({ vmPrintableStatus }) => {
  if (!vmPrintableStatus) return null;

  const Icon = getVMStatusIcon(vmPrintableStatus);

  return (
    <span>
      <Icon />{' '}
      <Button isInline variant={ButtonVariant.link}>
        {vmPrintableStatus}
      </Button>
    </span>
  );
};

export default StatusPopoverButton;
