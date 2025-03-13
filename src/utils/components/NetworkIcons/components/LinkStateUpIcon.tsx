import React, { FC } from 'react';

import PlugCircleCheckIcon from '@kubevirt-utils/components/NetworkIcons/components/PlugCircleCheckIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Tooltip, TooltipPosition } from '@patternfly/react-core';

import './LinkStateIcon.scss';

const LinkStateUpIcon: FC = ({}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Tooltip content={t('Up')} position={TooltipPosition.right}>
      <PlugCircleCheckIcon className="link-state-icon" fill="green" height="24px" width="24px" />
    </Tooltip>
  );
};

export default LinkStateUpIcon;
