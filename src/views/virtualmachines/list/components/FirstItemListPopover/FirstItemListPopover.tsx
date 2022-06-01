import * as React from 'react';

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

type FirstItemListPopoverProps = {
  items: string[];
  headerContent?: React.ReactNode | string;
  className?: string;
  includeCopyFirstItem?: boolean;
};

const FirstItemListPopover: React.FC<FirstItemListPopoverProps> = ({
  items,
  headerContent,
  className,
  includeCopyFirstItem,
}) => {
  const { t } = useKubevirtTranslation();
  return (
    <div className={className}>
      <div>
        {items?.[0] && includeCopyFirstItem ? (
          <ClipboardCopy
            variant={ClipboardCopyVariant.inlineCompact}
            isCode
            clickTip={t('Copied')}
            hoverTip={t('Copy to clipboard')}
          >
            {items?.[0]}
          </ClipboardCopy>
        ) : (
          items?.[0] || NO_DATA_DASH
        )}
      </div>
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
};

FirstItemListPopover.defaultProps = {
  headerContent: '',
  className: '',
};

export default FirstItemListPopover;
