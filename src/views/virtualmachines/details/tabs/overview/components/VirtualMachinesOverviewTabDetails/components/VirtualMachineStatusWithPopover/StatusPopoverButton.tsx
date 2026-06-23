import React, { ComponentClass, FC } from 'react';

import { Button, ButtonVariant } from '@patternfly/react-core';
import { getVMStatusIcon } from '@virtualmachines/utils';

type StatusPopoverButtonProps = {
  displayLabel?: string;
  statusIcon?: ComponentClass | FC;
  vmPrintableStatus?: string;
};

const StatusPopoverButton: FC<StatusPopoverButtonProps> = ({
  displayLabel,
  statusIcon,
  vmPrintableStatus,
}) => {
  if (!vmPrintableStatus && !displayLabel) return null;

  const Icon = statusIcon ?? getVMStatusIcon(vmPrintableStatus);
  const label = displayLabel ?? vmPrintableStatus;

  return (
    <span>
      <Icon />{' '}
      <Button isInline variant={ButtonVariant.link}>
        {label}
      </Button>
    </span>
  );
};

export default StatusPopoverButton;
