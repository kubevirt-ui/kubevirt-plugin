import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  FENCE_AGENTS_OPERATOR_NAME,
  NODE_HEALTH_OPERATOR_NAME,
} from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/constants';
import { isInstalled } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/utils';
import { useVirtualizationFeaturesContext } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/VirtualizationFeaturesContext';
import NotInstalledIconWithTooltip from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesList/components/icons/NotInstalledIconWithTooltip';
import { getInstalledStatusMessage } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/ConfigurationStep/components/HighAvailabilityConfigurationSection/utils/utils';
import { Split, SplitItem } from '@patternfly/react-core';

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
        {t(`Requires NHC (${nhcInstallMsg}) and FAR (${farInstallMsg})`)}
      </SplitItem>
    </Split>
  );
};

export default HAInstallStatusMessage;
