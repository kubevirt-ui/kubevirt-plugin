import React, { FC, MouseEventHandler, ReactNode } from 'react';

import { logHelpItemOpened } from '@kubevirt-utils/extensions/telemetry/learning';
import { TELEMETRY_HELP_ITEM_ID } from '@kubevirt-utils/extensions/telemetry/utils/property-constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  Icon,
  IconSize,
  Popover,
  PopoverPosition,
  PopoverProps,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import './HelpTextIcon.scss';

type HelpTextIconProps = {
  bodyContent: PopoverProps['bodyContent'];
  buttonAriaLabel?: string;
  className?: string;
  footerContent?: ReactNode;
  hasAutoWidth?: boolean;
  headerContent?: ReactNode;
  helpIconClassName?: string;
  helpItemId?: string;
  onClick?: MouseEventHandler<HTMLSpanElement>;
  position?: PopoverPosition;
  size?: IconSize;
};

const HelpTextIcon: FC<HelpTextIconProps> = ({
  bodyContent,
  buttonAriaLabel,
  className,
  footerContent,
  hasAutoWidth,
  headerContent,
  helpIconClassName = '',
  helpItemId = TELEMETRY_HELP_ITEM_ID.HELP_ICON,
  onClick,
  position = PopoverPosition.top,
  size,
}) => {
  const { t } = useKubevirtTranslation();

  const handleHelpClick: MouseEventHandler<HTMLSpanElement> = (event) => {
    logHelpItemOpened(
      helpItemId,
      typeof headerContent === 'string' ? headerContent : buttonAriaLabel,
      window.location.pathname,
    );
    onClick?.(event);
  };

  return (
    <Popover
      aria-label={t('Help')}
      bodyContent={bodyContent}
      className={className}
      footerContent={footerContent}
      hasAutoWidth={hasAutoWidth}
      headerContent={headerContent}
      position={position}
    >
      <Button
        icon={
          <Icon className={helpIconClassName} onClick={handleHelpClick} size={size}>
            <HelpIcon className="help-icon" />
          </Icon>
        }
        aria-label={buttonAriaLabel ?? t('Help')}
        hasNoPadding
        isInline
        variant="plain"
      />
    </Popover>
  );
};

export default HelpTextIcon;
