import React, { FCC, MouseEventHandler, ReactNode } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, Icon, IconSize, Popover, PopoverPosition } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import './HelpTextIcon.scss';

type HelpTextIconProps = {
  bodyContent: ((hide: () => void) => ReactNode) | ReactNode;
  buttonAriaLabel?: string;
  className?: string;
  footerContent?: ReactNode;
  hasAutoWidth?: boolean;
  headerContent?: ReactNode;
  helpIconClassName?: string;
  onClick?: MouseEventHandler<HTMLSpanElement>;
  position?: PopoverPosition;
  size?: IconSize;
};

const HelpTextIcon: FCC<HelpTextIconProps> = ({
  bodyContent,
  buttonAriaLabel,
  className,
  footerContent,
  hasAutoWidth,
  headerContent,
  helpIconClassName = '',
  onClick,
  position = PopoverPosition.top,
  size,
}) => {
  const { t } = useKubevirtTranslation();

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
          <Icon className={helpIconClassName} onClick={onClick} size={size}>
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
