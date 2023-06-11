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
  className?: string;
  headerContent?: React.ReactNode | string;
  includeCopyFirstItem?: boolean;
  items: string[];
};

const FirstItemListPopover: React.FC<FirstItemListPopoverProps> = ({
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
            {items?.[0]}
          </ClipboardCopy>
        ) : (
          items?.[0] || NO_DATA_DASH
        )}
      </div>
      {items?.length > 1 && (
        <Popover
          bodyContent={items.map((item) => (
            <div key={item}>{item}</div>
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
