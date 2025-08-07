import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import InstalledIcon from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/SummaryStep/components/icons/InstalledIcon';
import { Tooltip, TooltipPosition } from '@patternfly/react-core';

const InstalledIconWithTooltip: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Tooltip content={t('Installed')} position={TooltipPosition.right}>
      <InstalledIcon />
    </Tooltip>
  );
};

export default InstalledIconWithTooltip;
