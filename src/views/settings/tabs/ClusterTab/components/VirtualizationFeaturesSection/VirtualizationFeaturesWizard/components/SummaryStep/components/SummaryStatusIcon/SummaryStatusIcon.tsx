import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Split, SplitItem } from '@patternfly/react-core';
import SettingsLink from '@settings/context/SettingsLink';
import { InstallState } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/types';
import { installFailed } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/utils';
import {
  getInstallStateIcon,
  getInstallStateMessage,
} from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/SummaryStep/utils/utils';

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
          <SettingsLink forceExternal showExternalIcon to={operatorHubURL}>
            {t('Manage')}
          </SettingsLink>
        )}
      </SplitItem>
    </Split>
  );
};

export default SummaryStatusIcon;
