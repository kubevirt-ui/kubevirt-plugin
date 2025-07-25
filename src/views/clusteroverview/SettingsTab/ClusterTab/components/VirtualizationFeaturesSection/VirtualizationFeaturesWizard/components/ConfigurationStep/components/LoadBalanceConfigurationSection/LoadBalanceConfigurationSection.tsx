import React, { FC, useState } from 'react';

import ExpandSectionWithCustomToggle from '@kubevirt-utils/components/ExpandSectionWithCustomToggle/ExpandSectionWithCustomToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DESCHEDULER_OPERATOR_NAME } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/constants';
import { InstallState } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/types';
import { useVirtualizationFeaturesContext } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/VirtualizationFeaturesContext';
import DeschedulerSection from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesList/components/LoadBalanceSection/components/DeschedulerSection';
import HelpTextTooltipContent from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/HelpTextTooltipContent/HelpTextTooltipContent';
import { Checkbox, Split, SplitItem, Stack, StackItem } from '@patternfly/react-core';

import ConfigurationToggleContent from '../ConfigurationToggleContent/ConfigurationToggleContent';
import UseAlternativeOptionHelpIcon from '../UseAlternativeOptionHelpIcon/UseAlternativeOptionHelpIcon';

import './LoadBalanceConfigurationSection.scss';

const LoadBalanceConfigurationSection: FC = () => {
  const { t } = useKubevirtTranslation();
  const { operatorDetailsMap, updateInstallRequest } = useVirtualizationFeaturesContext();

  const [switchState, setSwitchState] = useState<boolean>(false);
  const [alternativeChecked, setAlternativeChecked] = useState<boolean>(false);

  const { installState, operatorHubURL } = operatorDetailsMap?.[DESCHEDULER_OPERATOR_NAME];
  const isInstalled = installState === InstallState.INSTALLED || alternativeChecked;

  const handleSwitchChange = (newSwitchState: boolean) => {
    setSwitchState(newSwitchState);
    updateInstallRequest(DESCHEDULER_OPERATOR_NAME, newSwitchState);
  };

  return (
    <ExpandSectionWithCustomToggle
      customContent={
        <ConfigurationToggleContent
          isInstalled={isInstalled}
          onSwitchChange={handleSwitchChange}
          operatorHubURL={operatorHubURL}
          switchState={switchState}
        />
      }
      helpTextContent={
        <HelpTextTooltipContent
          bodyText={t(
            'Load Aware Descheduler balances VM distribution across the cluster Nodes based on CPU utilization and Node CPU pressure',
          )}
          titleText={t('Load balance')}
        />
      }
      className="load-balance-configuration-section"
      id="load-balance-configuration-section"
      isIndented
      toggleContent={t('Load balance')}
    >
      <Stack hasGutter>
        <StackItem>
          <Split>
            <SplitItem>
              <Checkbox
                id="load-balance-alternative-checkbox"
                isChecked={alternativeChecked}
                label={<div>{t('I am using an alternative solution for this feature')}</div>}
                onChange={(_, checked) => setAlternativeChecked(checked)}
              />
            </SplitItem>
            <SplitItem>
              <UseAlternativeOptionHelpIcon />
            </SplitItem>
          </Split>
        </StackItem>
        <StackItem>
          <DeschedulerSection />
        </StackItem>
      </Stack>
    </ExpandSectionWithCustomToggle>
  );
};

export default LoadBalanceConfigurationSection;
