import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Tooltip, TooltipPosition } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import { NetworkIconProps } from './NetworkIcon';
import StateText from './StateText';

import './LinkStateIcon.scss';

const LinkStateUnsupportedIcon: FC<NetworkIconProps> = ({ configuredState, runtimeState }) => {
  const { t } = useKubevirtTranslation();

  return (
    <Tooltip
      content={
        <StateText
          {...{
            configuredState,
            details: t('Link state is not available for this type of network interface'),
            runtimeState,
          }}
        />
      }
      isContentLeftAligned
      position={TooltipPosition.right}
    >
      <HelpIcon className="link-state-icon" />
    </Tooltip>
  );
};

export default LinkStateUnsupportedIcon;
