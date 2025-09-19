import React, { FC } from 'react';

import ExternalLink from '@kubevirt-utils/components/ExternalLink/ExternalLink';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { InstallState } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/types';
import { installFailed } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/utils';
import {
  getInstallStateIcon,
  getInstallStateMessage,
} from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/SummaryStep/utils/utils';
import { Split, SplitItem } from '@patternfly/react-core';

import './SummaryStatusIcon.scss';

type SummaryStatusIconProps = {
  installState?: InstallState;
  operatorHubURL?: string;
};

const SummaryStatusIcon: FC<SummaryStatusIconProps> = ({ installState, operatorHubURL }) => {
  const { t } = useKubevirtTranslation();

  const Icon = getInstallStateIcon(installState);
  const message = getInstallStateMessage(installState, t);

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
