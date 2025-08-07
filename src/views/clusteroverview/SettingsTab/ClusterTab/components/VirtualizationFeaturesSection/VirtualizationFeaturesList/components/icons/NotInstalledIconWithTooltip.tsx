import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import NotInstalledIcon from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/SummaryStep/components/icons/NotInstalledIcon';
import { Tooltip, TooltipPosition } from '@patternfly/react-core';

const NotInstalledIconWithTooltip: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Tooltip
      content={t('Click "Configure features" to install this feature')}
      position={TooltipPosition.right}
    >
      <NotInstalledIcon />
    </Tooltip>
  );
};

export default NotInstalledIconWithTooltip;
