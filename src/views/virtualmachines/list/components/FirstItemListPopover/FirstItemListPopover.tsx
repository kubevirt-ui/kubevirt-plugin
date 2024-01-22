import React, { FC, ReactNode } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import {
  Button,
  ButtonVariant,
  ClipboardCopy,
  ClipboardCopyVariant,
  Popover,
  PopoverPosition,
} from '@patternfly/react-core';
import { IpAddresses } from '@virtualmachines/details/tabs/overview/components/VirtualMachinesOverviewTabNetworkInterfaces/utils/types';

type FirstItemListPopoverProps = {
  className?: string;
  headerContent?: ReactNode | string;
  includeCopyFirstItem?: boolean;
  items: IpAddresses;
};

const FirstItemListPopover: FC<FirstItemListPopoverProps> = ({
  className,
  headerContent,
  includeCopyFirstItem,
  items,
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <div className={className}>
      <div>
        {items?.[0] && includeCopyFirstItem ? (
          <ClipboardCopy
            clickTip={t('Copied')}
            hoverTip={t('Copy to clipboard')}
            isCode
            variant={ClipboardCopyVariant.inlineCompact}
          >
            {items?.[0]?.ip}
          </ClipboardCopy>
        ) : (
          items?.[0]?.ip || NO_DATA_DASH
        )}
      </div>
      {items?.length > 1 && (
        <Popover
          bodyContent={items.map(({ interfaceName, ip }) => (
            <div key={ip}>
              {interfaceName}: {ip}
            </div>
          ))}
          hasAutoWidth
          headerContent={headerContent}
          position={PopoverPosition.top}
        >
          <Button variant={ButtonVariant.link}>{`+${items.length - 1} more`}</Button>
        </Popover>
      )}
    </div>
  );
};

FirstItemListPopover.defaultProps = {
  className: '',
  headerContent: '',
};

export default FirstItemListPopover;
