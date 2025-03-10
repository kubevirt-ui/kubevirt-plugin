import React, { FC } from 'react';

import PlugCircleMinusIcon from '@kubevirt-utils/components/NetworkIcons/components/PlugCircleMinusIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Tooltip, TooltipPosition } from '@patternfly/react-core';

import './LinkStateIcon.scss';

const LinkStateDownIcon: FC = ({}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Tooltip content={t('Down')} position={TooltipPosition.right}>
      <PlugCircleMinusIcon className="link-state-icon" fill="red" height="24px" width="24px" />
    </Tooltip>
  );
};

export default LinkStateDownIcon;
