import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Tooltip, TooltipPosition } from '@patternfly/react-core';
import { InProgressIcon } from '@patternfly/react-icons';

import { NetworkIconProps } from './NetworkIcon';
import StateText from './StateText';

import './LinkStateIcon.scss';

const LinkStateAbsentIcon: FC<NetworkIconProps> = ({ configuredState, runtimeState }) => {
  const { t } = useKubevirtTranslation();

  return (
    <Tooltip
      content={
        <StateText
          {...{
            configuredState,
            details: t(
              'This interface is currently hot-unplugged until the VirtualMachine is migrated',
            ),
            runtimeState,
          }}
        />
      }
      isContentLeftAligned
      position={TooltipPosition.right}
    >
      <InProgressIcon className="link-state-icon" />
    </Tooltip>
  );
};

export default LinkStateAbsentIcon;
