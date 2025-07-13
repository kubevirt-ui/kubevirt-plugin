import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  NETOBSERV_OPERATOR_NAME,
  NMSTATE_OPERATOR_NAME,
} from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/constants';
import ConfigurationStepHeader from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/ConfigurationStep/components/ConfigurationStepHeader/ConfigurationStepHeader';
import LoadBalanceConfigurationSection from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/ConfigurationStep/components/LoadBalanceConfigurationSection/LoadBalanceConfigurationSection';
import VirtFeatureConfigurationItem from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/ConfigurationStep/components/VirtFeatureConfigurationItem/VirtFeatureConfigurationItem';
import { Stack, StackItem } from '@patternfly/react-core';

import HighAvailabilityConfigurationSection from './components/HighAvailabilityConfigurationSection/HighAvailabilityConfigurationSection';

import './ConfigurationStepContent.scss';

const ConfigurationStepContent: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <Stack className="feature-wizard-configuration-step" hasGutter>
      <StackItem>
        <ConfigurationStepHeader />
      </StackItem>
      <StackItem className="feature-wizard-configuration-step__item-container">
        <VirtFeatureConfigurationItem
          description={t('Network flows collector and monitoring solution.')}
          operatorName={NETOBSERV_OPERATOR_NAME}
          title={t('Network observability')}
        />
      </StackItem>
      <hr />
      <StackItem className="feature-wizard-configuration-step__item-container">
        <VirtFeatureConfigurationItem
          description={t(
            'OpenShift Container Platform uses nmstate to report on and configure the state of the node network.',
          )}
          operatorName={NMSTATE_OPERATOR_NAME}
          title={t('Host network management (NMState)')}
        />
      </StackItem>
      <hr />
      <StackItem className="feature-wizard-configuration-step__item-container">
        <HighAvailabilityConfigurationSection />
      </StackItem>
      <hr />
      <StackItem className="feature-wizard-configuration-step__item-container">
        <LoadBalanceConfigurationSection />
      </StackItem>
    </Stack>
  );
};

export default ConfigurationStepContent;
