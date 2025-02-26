import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { Tooltip, TooltipPosition } from '@patternfly/react-core';

import './LinkStateIcon.scss';

const LinkStateSRIOVIcon: FC = ({}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Tooltip
      content={t('Link state is not available for SR-IOV interfaces')}
      position={TooltipPosition.right}
    >
      <div className="link-state-icon">{NO_DATA_DASH}</div>
    </Tooltip>
  );
};

export default LinkStateSRIOVIcon;
