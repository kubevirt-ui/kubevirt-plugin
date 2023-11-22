import * as React from 'react';
import { FC, ReactNode } from 'react';
import classNames from 'classnames';

import { Popover, PopoverPosition } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import './HelpTextIcon.scss';

type HelpTextIconProps = {
  bodyContent: ReactNode;
  className?: string;
  helpIconClassName?: string;
  position?: PopoverPosition;
};

const HelpTextIcon: FC<HelpTextIconProps> = ({
  bodyContent,
  className = 'help-text-icon__popover',
  helpIconClassName = '',
  position = PopoverPosition.top,
}) => (
  <Popover aria-label={'Help'} bodyContent={bodyContent} className={className} position={position}>
    <HelpIcon className={classNames('help-icon__cursor', helpIconClassName)} />
  </Popover>
);

export default HelpTextIcon;
