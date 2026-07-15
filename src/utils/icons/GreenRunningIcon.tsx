import type { FC } from 'react';
import React from 'react';

import type { IconComponentProps } from '@patternfly/react-core';
import { Icon } from '@patternfly/react-core';
import { RunningIcon } from '@patternfly/react-icons';

type IconProps = Omit<IconComponentProps, 'status'>;

export const GreenRunningIcon: FC<IconProps> = (props) => (
  <Icon status="success" {...props}>
    <RunningIcon />
  </Icon>
);
