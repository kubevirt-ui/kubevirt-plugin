import React, { FCC, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DESCHEDULER_OPERATORS_URL } from '@kubevirt-utils/resources/descheduler/constants';
import { Split, SplitItem, Switch } from '@patternfly/react-core';
import SettingsLink from '@settings/context/SettingsLink';
import { DESCHEDULER_OPERATOR_NAME } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/constants';
import { isInstalled } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/utils';
import { useVirtualizationFeaturesContext } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/VirtualizationFeaturesContext';
import InstalledIconWithTooltip from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesList/components/icons/InstalledIconWithTooltip';

import './LoadBalanceToggleContent.scss';

type LoadBalanceToggleContentProps = {
  alternativeChecked: boolean;
};

const LoadBalanceToggleContent: FCC<LoadBalanceToggleContentProps> = ({ alternativeChecked }) => {
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
          <SettingsLink forceExternal showExternalIcon to={DESCHEDULER_OPERATORS_URL}>
            {t('Manage')}
          </SettingsLink>
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
