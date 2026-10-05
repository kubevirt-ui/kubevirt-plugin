import type { FC } from 'react';

import type { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, Popover, PopoverPosition } from '@patternfly/react-core';

import BulkVMsPopover from './BulkVMsPopover';

type VmCountPopoverLinkProps = {
  vms: V1VirtualMachine[];
};

const VmCountPopoverLink: FC<VmCountPopoverLinkProps> = ({ vms }) => {
  const { t } = useKubevirtTranslation();

  return (
    <Popover
      bodyContent={<BulkVMsPopover vms={vms} />}
      className="confirm-multiple-vm-actions-modal__popover"
      position={PopoverPosition.right}
    >
      <Button isInline variant="link">
        {t('{{count}} VirtualMachine', { count: vms.length })}
      </Button>
    </Popover>
  );
};

export default VmCountPopoverLink;
