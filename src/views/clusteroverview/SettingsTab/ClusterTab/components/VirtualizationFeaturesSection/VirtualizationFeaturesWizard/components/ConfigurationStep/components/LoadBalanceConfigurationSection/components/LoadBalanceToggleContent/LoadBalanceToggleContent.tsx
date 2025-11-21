import React, { FC, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DESCHEDULER_OPERATORS_URL } from '@kubevirt-utils/resources/descheduler/constants';
import { DESCHEDULER_OPERATOR_NAME } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/constants';
import { isInstalled } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/utils';
import { useVirtualizationFeaturesContext } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/VirtualizationFeaturesContext';
import InstalledIconWithTooltip from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesList/components/icons/InstalledIconWithTooltip';
import { Split, SplitItem, Switch } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import './LoadBalanceToggleContent.scss';

type LoadBalanceToggleContentProps = {
  alternativeChecked: boolean;
};

const LoadBalanceToggleContent: FC<LoadBalanceToggleContentProps> = ({ alternativeChecked }) => {
  const { t } = useKubevirtTranslation();

  const { operatorDetailsMap, updateInstallRequests } = useVirtualizationFeaturesContext();

  const [switchState, setSwitchState] = useState<boolean>(false);

  const { installState } = operatorDetailsMap?.[DESCHEDULER_OPERATOR_NAME] || {};
  const deschedulerInstalled = isInstalled(installState);
  const haFeatureInstalled = deschedulerInstalled || alternativeChecked;

  const handleSwitchChange = (newSwitchState: boolean) => {
    setSwitchState(newSwitchState);
    updateInstallRequests({ [DESCHEDULER_OPERATOR_NAME]: newSwitchState });
  };

  return (
    <Split className="load-balance-toggle-content" hasGutter>
      {deschedulerInstalled && (
        <SplitItem className="load-balance-toggle-content__hub-link">
          <a href={DESCHEDULER_OPERATORS_URL} rel="noreferrer" target="_blank">
            {t('Manage')}
            <ExternalLinkAltIcon className="load-balance-toggle-content__link-icon" />
          </a>
        </SplitItem>
      )}
      <SplitItem className="load-balance-toggle-content__icon-switch-container">
        {haFeatureInstalled ? (
          <InstalledIconWithTooltip />
        ) : (
          <Switch
            data-test-id="load-balance"
            isChecked={switchState}
            onChange={(_event, newSwitchState) => handleSwitchChange(newSwitchState)}
          />
        )}
      </SplitItem>
    </Split>
  );
};

export default LoadBalanceToggleContent;
