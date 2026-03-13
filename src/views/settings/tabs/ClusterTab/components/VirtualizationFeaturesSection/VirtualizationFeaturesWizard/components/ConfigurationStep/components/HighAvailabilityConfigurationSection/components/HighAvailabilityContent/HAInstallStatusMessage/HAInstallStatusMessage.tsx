import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Split, SplitItem } from '@patternfly/react-core';
import {
  FENCE_AGENTS_OPERATOR_NAME,
  NODE_HEALTH_OPERATOR_NAME,
} from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/constants';
import { isInstalled } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/utils';
import { useVirtualizationFeaturesContext } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/VirtualizationFeaturesContext';
import NotInstalledIconWithTooltip from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesList/components/icons/NotInstalledIconWithTooltip';
import { getInstalledStatusMessage } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/ConfigurationStep/components/HighAvailabilityConfigurationSection/utils/utils';

import './HAInstallStatusMessage.scss';

const HAInstallStatusMessage: FC = () => {
  const { t } = useKubevirtTranslation();
  const { operatorDetailsMap } = useVirtualizationFeaturesContext();

  const nhcInstalled = isInstalled(operatorDetailsMap?.[NODE_HEALTH_OPERATOR_NAME]?.installState);
  const nhcInstallMsg = getInstalledStatusMessage(nhcInstalled);

  const farInstalled = isInstalled(operatorDetailsMap?.[FENCE_AGENTS_OPERATOR_NAME]?.installState);
  const farInstallMsg = getInstalledStatusMessage(farInstalled);

  if (nhcInstalled && farInstalled) return null;

  return (
    <Split>
      <SplitItem>
        <NotInstalledIconWithTooltip />
      </SplitItem>
      <SplitItem className="ha-install-status-message">
        {t('Requires NHC ({{nhcStatus}}) and FAR ({{farStatus}})', {
          farStatus: farInstallMsg,
          nhcStatus: nhcInstallMsg,
        })}
      </SplitItem>
    </Split>
  );
};

export default HAInstallStatusMessage;
