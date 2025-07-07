import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Tooltip, TooltipPosition } from '@patternfly/react-core';
import { CheckCircleIcon } from '@patternfly/react-icons';

const InstalledIcon: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Tooltip content={t('Installed')} position={TooltipPosition.right}>
      <CheckCircleIcon />
    </Tooltip>
  );
};

export default InstalledIcon;
