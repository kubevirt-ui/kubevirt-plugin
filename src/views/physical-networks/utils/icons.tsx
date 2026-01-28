import React from 'react';

import { RedExclamationCircleIcon } from '@openshift-console/dynamic-plugin-sdk';
import { Icon } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  CloseIcon,
  HourglassHalfIcon,
  InProgressIcon,
} from '@patternfly/react-icons';

import { EnactmentState } from './types';

export const IconsByStatus = {
  [EnactmentState.Aborted]: (
    <Icon status="danger">
      <CloseIcon />
    </Icon>
  ),
  [EnactmentState.Available]: (
    <Icon status="success">
      <CheckCircleIcon />
    </Icon>
  ),
  [EnactmentState.Failing]: <RedExclamationCircleIcon />,
  [EnactmentState.Pending]: <HourglassHalfIcon />,
  [EnactmentState.Progressing]: <InProgressIcon />,
};
