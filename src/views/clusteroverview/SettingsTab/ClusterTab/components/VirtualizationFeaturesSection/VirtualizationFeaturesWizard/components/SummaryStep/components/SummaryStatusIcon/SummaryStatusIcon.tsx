import React, { FC } from 'react';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  InstallState,
  VirtualizationFeatureOperators,
} from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/types';
import { installFailed } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/utils';
import { useVirtualizationFeaturesContext } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/VirtualizationFeaturesContext';
import {
  getInstallStateIcon,
  getInstallStateMessage,
} from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/SummaryStep/utils/utils';
import { Split, SplitItem } from '@patternfly/react-core';

import './SummaryStatusIcon.scss';

type SummaryStatusIconProps = {
  computedInstallState?: InstallState;
  operatorName?: VirtualizationFeatureOperators;
};

const SummaryStatusIcon: FC<SummaryStatusIconProps> = ({ computedInstallState, operatorName }) => {
  const { t } = useKubevirtTranslation();
  const { operatorDetailsMap, operatorsToInstall } = useVirtualizationFeaturesContext();
  const { installState: operatorInstallState, operatorHubURL } =
    operatorDetailsMap?.[operatorName] || {};
  const installState = operatorInstallState || computedInstallState;
  const toBeInstalled = operatorsToInstall[operatorName];

  const Icon = getInstallStateIcon(installState, toBeInstalled);
  const message = getInstallStateMessage(installState, toBeInstalled);

  return (
    <Split className="summary-status-icon">
      <SplitItem className="summary-status-icon__icon summary-status-icon__icon-margin">
        {Icon && <Icon />}
      </SplitItem>
      <SplitItem className="summary-status-icon__message">{message}</SplitItem>
      <SplitItem>
        {installFailed(installState) && (
          <ExternalLink href={operatorHubURL}>{t('Manage')}</ExternalLink>
        )}
      </SplitItem>
    </Split>
  );
};

export default SummaryStatusIcon;
