import * as React from 'react';
import { FC, MouseEventHandler, ReactNode } from 'react';

import { Icon, IconSize, Popover, PopoverPosition } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import './HelpTextIcon.scss';

type HelpTextIconProps = {
  bodyContent: ((hide: () => void) => ReactNode) | ReactNode;
  className?: string;
  footerContent?: ReactNode;
  headerContent?: ReactNode;
  helpIconClassName?: string;
  onClick?: MouseEventHandler<HTMLSpanElement>;
  position?: PopoverPosition;
  size?: IconSize;
};

const HelpTextIcon: FC<HelpTextIconProps> = ({
  bodyContent,
  className = 'help-text-icon__popover',
  footerContent,
  headerContent,
  helpIconClassName = '',
  onClick,
  position = PopoverPosition.top,
  size,
}) => (
  <Popover
    aria-label={'Help'}
    bodyContent={bodyContent}
    className={className}
    footerContent={footerContent}
    headerContent={headerContent}
    position={position}
  >
    <Icon className={helpIconClassName} onClick={onClick} size={size}>
      <HelpIcon className="help-icon" />
    </Icon>
  </Popover>
);

export default HelpTextIcon;
