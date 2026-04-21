import React, { FC } from 'react';

import PlugCircleMinusIcon from '@kubevirt-utils/components/NetworkIcons/PlugCircleMinusIcon';
import { Tooltip, TooltipPosition } from '@patternfly/react-core';

import { NetworkIconProps } from './NetworkIcon';
import StateText from './StateText';

import './LinkStateIcon.scss';

const LinkStateDownIcon: FC<NetworkIconProps> = ({ configuredState, runtimeState }) => {
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
      <PlugCircleMinusIcon className="link-state-icon" />
    </Tooltip>
  );
};

export default LinkStateDownIcon;
