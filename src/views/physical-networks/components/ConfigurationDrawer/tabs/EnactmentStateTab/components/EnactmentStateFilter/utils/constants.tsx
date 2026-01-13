import React from 'react';

import { EnactmentState } from '../../../../../../../utils/types';
import EnactmentStateWithIcon from '../../../../../../EnactmentStateWithIcon';

export const enactmentStateDropdownItems = [
  {
    content: <EnactmentStateWithIcon status={EnactmentState.Aborted} />,
    id: EnactmentState.Aborted,
  },
  {
    content: <EnactmentStateWithIcon status={EnactmentState.Available} />,
    id: EnactmentState.Available,
  },
  {
    content: <EnactmentStateWithIcon status={EnactmentState.Failing} />,
    id: EnactmentState.Failing,
  },
  {
    content: <EnactmentStateWithIcon status={EnactmentState.Pending} />,
    id: EnactmentState.Pending,
  },
  {
    content: <EnactmentStateWithIcon status={EnactmentState.Progressing} />,
    id: EnactmentState.Progressing,
  },
];
