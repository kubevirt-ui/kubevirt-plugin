import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { NetworkInterfaceState } from '@kubevirt-utils/resources/vm/utils/network/types';
import { Tooltip, TooltipPosition } from '@patternfly/react-core';

import { NetworkIconProps } from './NetworkIcon';
import StateText from './StateText';

import './LinkStateIcon.scss';

const LinkStateNoDataIcon: FC<NetworkIconProps> = ({ configuredState, runtimeState }) => {
  const { t } = useKubevirtTranslation();

  const unsupportedText =
    configuredState === NetworkInterfaceState.UNSUPPORTED
      ? t('Link state is not available for this type of network interface')
      : '';

  return (
    <Tooltip
      content={
        <StateText
          {...{
            configuredState,
            details: unsupportedText,
            runtimeState,
          }}
        />
      }
      isContentLeftAligned
      position={TooltipPosition.right}
    >
      <div className="link-state-icon">{NO_DATA_DASH}</div>
    </Tooltip>
  );
};

export default LinkStateNoDataIcon;
