import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Tooltip, TooltipPosition } from '@patternfly/react-core';
import { InfoCircleIcon } from '@patternfly/react-icons';

const NotInstalledIcon: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Tooltip
      content={t('Click "Configure features" to install this feature')}
      position={TooltipPosition.right}
    >
      <InfoCircleIcon />
    </Tooltip>
  );
};

export default NotInstalledIcon;
