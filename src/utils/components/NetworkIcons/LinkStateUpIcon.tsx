import React, { FC } from 'react';

import PlugCircleCheckIcon from '@kubevirt-utils/components/NetworkIcons/PlugCircleCheckIcon';
import { Tooltip, TooltipPosition } from '@patternfly/react-core';

import { NetworkIconProps } from './NetworkIcon';
import StateText from './StateText';

import './LinkStateIcon.scss';

const LinkStateUpIcon: FC<NetworkIconProps> = ({ configuredState, runtimeState }) => {
  return (
    <Tooltip
      content={
        <StateText
          {...{
            configuredState,
            runtimeState,
          }}
        />
      }
      isContentLeftAligned
      position={TooltipPosition.right}
    >
      <PlugCircleCheckIcon className="link-state-icon" />
    </Tooltip>
  );
};

export default LinkStateUpIcon;
