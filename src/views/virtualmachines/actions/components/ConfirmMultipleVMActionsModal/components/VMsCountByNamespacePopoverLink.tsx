import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Popover, PopoverPosition } from '@patternfly/react-core';

import VMsByNamespacePopover from './VMsByNamespacePopover';

type VMsCountByNamespacePopoverLinkProps = {
  suffix?: string;
  vmsByNamespace: Record<string, string[]>;
};

const VMsCountByNamespacePopoverLink: FC<VMsCountByNamespacePopoverLinkProps> = ({
  suffix,
  vmsByNamespace,
}) => {
  const { t } = useKubevirtTranslation();
  const numVMs = Object.values(vmsByNamespace).flat().length;
  const numNamespaces = Object.keys(vmsByNamespace).length;

  return (
    <Popover
      bodyContent={<VMsByNamespacePopover vmsByNamespace={vmsByNamespace} />}
      className="confirm-multiple-vm-actions-modal__popover"
      position={PopoverPosition.right}
    >
      <a>
        {t('{{count}} VirtualMachine', { count: numVMs })} {t('in')}{' '}
        {t('{{count}} namespace', { count: numNamespaces })}
        {suffix}
      </a>
    </Popover>
  );
};

export default VMsCountByNamespacePopoverLink;
