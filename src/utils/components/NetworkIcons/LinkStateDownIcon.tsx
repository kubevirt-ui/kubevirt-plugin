import React, { FC } from 'react';

import PlugCircleMinusIcon from '@kubevirt-utils/components/NetworkIcons/PlugCircleMinusIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Tooltip, TooltipPosition } from '@patternfly/react-core';

import { NetworkIconProps } from './NetworkIcon';
import { stateText } from './utils';

import './LinkStateIcon.scss';

const LinkStateDownIcon: FC<NetworkIconProps> = ({ configuredState, runtimeState }) => {
  const { t } = useKubevirtTranslation();

  return (
    <Tooltip
      content={stateText({ configuredState, runtimeState, t })}
      position={TooltipPosition.right}
    >
      <PlugCircleMinusIcon className="link-state-icon" />
    </Tooltip>
  );
};

export default LinkStateDownIcon;
