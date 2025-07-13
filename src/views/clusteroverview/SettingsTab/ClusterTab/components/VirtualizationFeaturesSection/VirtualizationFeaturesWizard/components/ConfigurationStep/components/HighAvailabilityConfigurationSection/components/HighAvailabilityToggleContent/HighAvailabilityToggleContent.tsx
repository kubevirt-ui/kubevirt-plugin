import React, { FC, useEffect, useState } from 'react';

import {
  FENCE_AGENTS_OPERATOR_NAME,
  NODE_HEALTH_OPERATOR_NAME,
} from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/constants';
import { isInstalled } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/utils';
import { useVirtualizationFeaturesContext } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/VirtualizationFeaturesContext';
import InstalledIconWithTooltip from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesList/components/icons/InstalledIconWithTooltip';
import HAInstallStatusMessage from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/ConfigurationStep/components/HighAvailabilityConfigurationSection/components/HighAvailabilityContent/HAInstallStatusMessage/HAInstallStatusMessage';
import SwitchWithTooltip from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/ConfigurationStep/components/HighAvailabilityConfigurationSection/components/HighAvailabilityToggleContent/SwitchWithTooltip';
import { HAAlternativeCheckedMap } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/ConfigurationStep/components/HighAvailabilityConfigurationSection/utils/types';
import { getDisabledSwitchTooltipMsg } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/ConfigurationStep/components/HighAvailabilityConfigurationSection/utils/utils';
import { Split, SplitItem } from '@patternfly/react-core';

import './HighAvailabilityToggleContent.scss';

type HighAvailabilityToggleContentProps = {
  alternativeCheckedMap: HAAlternativeCheckedMap;
};

const HighAvailabilityToggleContent: FC<HighAvailabilityToggleContentProps> = ({
  alternativeCheckedMap,
}) => {
  const [switchState, setSwitchState] = useState<boolean>(false);

  const { operatorDetailsMap, operatorsToInstall, updateInstallRequests } =
    useVirtualizationFeaturesContext();
  const farToBeInstalled = operatorsToInstall[FENCE_AGENTS_OPERATOR_NAME];
  const nhcToBeInstalled = operatorsToInstall[NODE_HEALTH_OPERATOR_NAME];

  const handleSwitchChange = (newSwitchState: boolean) => {
    updateInstallRequests({
      [FENCE_AGENTS_OPERATOR_NAME]: newSwitchState,
      [NODE_HEALTH_OPERATOR_NAME]: newSwitchState,
    });

    setSwitchState(newSwitchState);
  };

  useEffect(() => {
    if (farToBeInstalled && nhcToBeInstalled) setSwitchState(true);
    else setSwitchState(false);
  }, [farToBeInstalled, nhcToBeInstalled, setSwitchState]);

  const bothAlternativeOptionsChecked = Object.values(alternativeCheckedMap).every(
    (checked) => checked,
  );

  const farInstalled = isInstalled(operatorDetailsMap?.[FENCE_AGENTS_OPERATOR_NAME]?.installState);
  const nhcInstalled = isInstalled(operatorDetailsMap?.[NODE_HEALTH_OPERATOR_NAME]?.installState);

  const haFeatureInstalled = (nhcInstalled && farInstalled) || bothAlternativeOptionsChecked;

  return (
    <Split className="high-availability-toggle-content" hasGutter>
      {!haFeatureInstalled && (
        <SplitItem className="high-availability-toggle-content__install-status-msg">
          <HAInstallStatusMessage />
        </SplitItem>
      )}
      <SplitItem className="high-availability-toggle-content__icon-switch-container">
        {haFeatureInstalled ? (
          <InstalledIconWithTooltip />
        ) : (
          <SwitchWithTooltip
            disabledTooltipContent={getDisabledSwitchTooltipMsg(nhcInstalled, farInstalled)}
            onSwitchChange={handleSwitchChange}
            switchState={switchState}
          />
        )}
      </SplitItem>
    </Split>
  );
};

export default HighAvailabilityToggleContent;
