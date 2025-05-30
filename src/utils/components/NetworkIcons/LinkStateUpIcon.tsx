import React, { FC } from 'react';

import PlugCircleCheckIcon from '@kubevirt-utils/components/NetworkIcons/PlugCircleCheckIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Tooltip, TooltipPosition } from '@patternfly/react-core';

import { NetworkIconProps } from './NetworkIcon';
import { stateText } from './utils';

import './LinkStateIcon.scss';

const LinkStateUpIcon: FC<NetworkIconProps> = ({ configuredState, runtimeState }) => {
  const { t } = useKubevirtTranslation();

  return (
    <Tooltip
      content={stateText({ configuredState, runtimeState, t })}
      position={TooltipPosition.right}
    >
      <PlugCircleCheckIcon className="link-state-icon" />
    </Tooltip>
  );
};

export default LinkStateUpIcon;
