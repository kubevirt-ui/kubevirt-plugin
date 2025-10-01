import * as React from 'react';
import { FC, MouseEventHandler, ReactNode } from 'react';
import classNames from 'classnames';

import { Icon, IconSize, Popover, PopoverPosition } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import './HelpTextIcon.scss';

type HelpTextIconProps = {
  bodyContent: ReactNode;
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
    <Icon onClick={onClick} size={size}>
      <HelpIcon className={classNames('help-icon', helpIconClassName)} />
    </Icon>
  </Popover>
);

export default HelpTextIcon;
