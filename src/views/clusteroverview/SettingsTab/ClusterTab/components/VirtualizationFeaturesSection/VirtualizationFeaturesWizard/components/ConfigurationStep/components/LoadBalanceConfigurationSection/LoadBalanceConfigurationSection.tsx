import React, { FC, useState } from 'react';

import ExpandSectionWithCustomToggle from '@kubevirt-utils/components/ExpandSectionWithCustomToggle/ExpandSectionWithCustomToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import PopoverContentWithLightspeedButton from '@lightspeed/components/PopoverContentWithLightspeedButton/PopoverContentWithLightspeedButton';
import { OLSPromptType } from '@lightspeed/utils/prompts';
import { DESCHEDULER_OPERATOR_NAME } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/constants';
import { isInstalled } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/utils';
import { useVirtualizationFeaturesContext } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/VirtualizationFeaturesContext';
import DeschedulerSection from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesList/components/LoadBalanceSection/components/DeschedulerSection';
import LoadBalanceToggleContent from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/ConfigurationStep/components/LoadBalanceConfigurationSection/components/LoadBalanceToggleContent/LoadBalanceToggleContent';
import HelpTextTooltipContent from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/HelpTextTooltipContent/HelpTextTooltipContent';
import { Stack, StackItem } from '@patternfly/react-core';

import UseAlternativeOptionCheckbox from '../UseAlternativeOptionCheckbox/UseAlternativeOptionCheckbox';

import './LoadBalanceConfigurationSection.scss';

const LoadBalanceConfigurationSection: FC = () => {
  const { t } = useKubevirtTranslation();
  const [alternativeChecked, setAlternativeChecked] = useState<boolean>(false);

  const { operatorDetailsMap } = useVirtualizationFeaturesContext();
  const { installState } = operatorDetailsMap?.[DESCHEDULER_OPERATOR_NAME] || {};
  const isOperatorInstalled = isInstalled(installState);

  return (
    <ExpandSectionWithCustomToggle
      helpTextContent={(hide) => (
        <PopoverContentWithLightspeedButton
          content={
            <HelpTextTooltipContent
              bodyText={t(
                'Load Aware Descheduler balances VM distribution across the cluster Nodes based on CPU utilization and Node CPU pressure',
              )}
              titleText={t('Load balance')}
            />
          }
          hide={hide}
          promptType={OLSPromptType.LOAD_BALANCE}
        />
      )}
      className="load-balance-configuration-section"
      customContent={<LoadBalanceToggleContent alternativeChecked={alternativeChecked} />}
      id="load-balance-configuration-section"
      isIndented
      toggleContent={t('Load balance')}
    >
      <Stack hasGutter>
        <StackItem>
          <UseAlternativeOptionCheckbox
            id="load-balance-alternative-checkbox"
            isChecked={alternativeChecked}
            onChange={setAlternativeChecked}
          />
        </StackItem>
        <StackItem>
          <DeschedulerSection isOperatorInstalled={isOperatorInstalled} />
        </StackItem>
      </Stack>
    </ExpandSectionWithCustomToggle>
  );
};

export default LoadBalanceConfigurationSection;
