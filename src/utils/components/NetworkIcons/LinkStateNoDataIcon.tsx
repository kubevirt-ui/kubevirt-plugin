import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { Tooltip, TooltipPosition } from '@patternfly/react-core';

import { NetworkInterfaceState } from '../NetworkInterfaceModal/utils/types';

import { NetworkIconProps } from './NetworkIcon';
import { stateText } from './utils';

import './LinkStateIcon.scss';

const LinkStateNoDataIcon: FC<NetworkIconProps> = ({ configuredState, runtimeState }) => {
  const { t } = useKubevirtTranslation();

  const unsupportedText =
    configuredState === NetworkInterfaceState.UNSUPPORTED
      ? `\n${t('Link state is not available for this type of network interface')}`
      : '';

  return (
    <Tooltip
      content={`${stateText({ configuredState, runtimeState, t })}${unsupportedText}`}
      position={TooltipPosition.right}
    >
      <div className="link-state-icon">{NO_DATA_DASH}</div>
    </Tooltip>
  );
};

export default LinkStateNoDataIcon;
