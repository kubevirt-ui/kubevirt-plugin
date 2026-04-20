import React, { FCC, useEffect, useState } from 'react';

import { Split, SplitItem } from '@patternfly/react-core';
import {
  FENCE_AGENTS_OPERATOR_NAME,
  NODE_HEALTH_OPERATOR_NAME,
} from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/constants';
import { isInstalled } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/utils';
import { useVirtualizationFeaturesContext } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/VirtualizationFeaturesContext';
import InstalledIconWithTooltip from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesList/components/icons/InstalledIconWithTooltip';
import HAInstallStatusMessage from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/ConfigurationStep/components/HighAvailabilityConfigurationSection/components/HighAvailabilityContent/HAInstallStatusMessage/HAInstallStatusMessage';
import SwitchWithTooltip from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/ConfigurationStep/components/HighAvailabilityConfigurationSection/components/HighAvailabilityToggleContent/SwitchWithTooltip';
import { HAAlternativeCheckedMap } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/ConfigurationStep/components/HighAvailabilityConfigurationSection/utils/types';
import { getDisabledSwitchTooltipMsg } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/ConfigurationStep/components/HighAvailabilityConfigurationSection/utils/utils';

import './HighAvailabilityToggleContent.scss';

type HighAvailabilityToggleContentProps = {
  alternativeCheckedMap: HAAlternativeCheckedMap;
};

const HighAvailabilityToggleContent: FCC<HighAvailabilityToggleContentProps> = ({
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
  }, [farToBeInstalled, nhcToBeInstalled]);

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
            dataTestID="high-availability"
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
