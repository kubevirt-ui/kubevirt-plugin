import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Tooltip, TooltipPosition } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

import './LinkStateIcon.scss';

const LinkStateUnsupportedIcon: FC = ({}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Tooltip
      content={t('Link state is not available for this type of network interface')}
      position={TooltipPosition.right}
    >
      <HelpIcon className="link-state-icon" />
    </Tooltip>
  );
};

export default LinkStateUnsupportedIcon;
