import React, { FC, useState } from 'react';

import ExpandSectionWithCustomToggle from '@kubevirt-utils/components/ExpandSectionWithCustomToggle/ExpandSectionWithCustomToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import DeschedulerSection from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesList/components/LoadBalanceSection/components/DeschedulerSection';
import LoadBalanceToggleContent from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/ConfigurationStep/components/LoadBalanceConfigurationSection/components/LoadBalanceToggleContent/LoadBalanceToggleContent';
import HelpTextTooltipContent from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/HelpTextTooltipContent/HelpTextTooltipContent';
import { Checkbox, Split, SplitItem, Stack, StackItem } from '@patternfly/react-core';

import UseAlternativeOptionHelpIcon from '../UseAlternativeOptionHelpIcon/UseAlternativeOptionHelpIcon';

import './LoadBalanceConfigurationSection.scss';

const LoadBalanceConfigurationSection: FC = () => {
  const { t } = useKubevirtTranslation();
  const [alternativeChecked, setAlternativeChecked] = useState<boolean>(false);

  return (
    <ExpandSectionWithCustomToggle
      helpTextContent={
        <HelpTextTooltipContent
          bodyText={t(
            'Load Aware Descheduler balances VM distribution across the cluster Nodes based on CPU utilization and Node CPU pressure',
          )}
          titleText={t('Load balance')}
        />
      }
      className="load-balance-configuration-section"
      customContent={<LoadBalanceToggleContent alternativeChecked={alternativeChecked} />}
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
