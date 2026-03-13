import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Tooltip, TooltipPosition } from '@patternfly/react-core';
import InstalledIcon from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/SummaryStep/components/icons/InstalledIcon';

const InstalledIconWithTooltip: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Tooltip content={t('Installed')} position={TooltipPosition.right}>
      <InstalledIcon />
    </Tooltip>
  );
};

export default InstalledIconWithTooltip;
