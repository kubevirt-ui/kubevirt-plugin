import React, { FCC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Tooltip, TooltipPosition } from '@patternfly/react-core';
import NotInstalledIcon from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/SummaryStep/components/icons/NotInstalledIcon';

const NotInstalledIconWithTooltip: FCC = () => {
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
