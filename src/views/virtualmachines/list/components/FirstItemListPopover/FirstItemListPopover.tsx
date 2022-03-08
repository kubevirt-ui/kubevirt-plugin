import * as React from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { Button, ButtonVariant, Popover, PopoverPosition } from '@patternfly/react-core';

type FirstItemListPopoverProps = {
  items: string[];
  headerContent?: React.ReactNode | string;
  className?: string;
};

export const getVMIIPAddresses = (vmi: V1VirtualMachineInstance): string[] => {
  const namedInterfaces = vmi?.status?.interfaces?.filter((iface) => !!iface.name) || [];
  const ipAddresses = namedInterfaces?.flatMap((iface) => [
    iface?.ipAddress,
    ...(iface?.ipAddresses || []),
  ]);
  const trimmedIPAddresses = ipAddresses?.map((ip) => ip.trim())?.filter((ip) => ip.length > 0);
  return [...new Set(trimmedIPAddresses)];
};

const FirstItemListPopover: React.FC<FirstItemListPopoverProps> = ({
  items,
  headerContent,
  className,
}) => (
  <div className={className}>
    <div>{items?.[0]}</div>
    {items?.length > 1 && (
      <Popover
        headerContent={headerContent}
        bodyContent={items.map((item) => (
          <div key={item}>{item}</div>
        ))}
        position={PopoverPosition.top}
        hasAutoWidth
      >
        <Button variant={ButtonVariant.link}>{`+${items.length - 1} more`}</Button>
      </Popover>
    )}
  </div>
);

FirstItemListPopover.defaultProps = {
  headerContent: '',
  className: '',
};

export default FirstItemListPopover;
