import * as React from 'react';
import { FC, ReactNode } from 'react';
import classNames from 'classnames';

import { Icon, IconSize, Popover, PopoverPosition } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import './HelpTextIcon.scss';

type HelpTextIconProps = {
  bodyContent: ReactNode;
  className?: string;
  headerContent?: ReactNode;
  helpIconClassName?: string;
  position?: PopoverPosition;
  size?: IconSize;
};

const HelpTextIcon: FC<HelpTextIconProps> = ({
  bodyContent,
  className = 'help-text-icon__popover',
  headerContent,
  helpIconClassName = '',
  position = PopoverPosition.top,
  size,
}) => (
  <Popover
    aria-label={'Help'}
    bodyContent={bodyContent}
    className={className}
    headerContent={headerContent}
    position={position}
  >
    <Icon size={size}>
      <HelpIcon className={classNames('help-icon__cursor', helpIconClassName)} />
    </Icon>
  </Popover>
);

export default HelpTextIcon;
