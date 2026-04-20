import React, { FCC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Bullseye, Spinner, Stack, StackItem } from '@patternfly/react-core';
import {
  CLUSTER_OBSERVABILITY_OPERATOR_NAME,
  NETOBSERV_OPERATOR_NAME,
  NMSTATE_OPERATOR_NAME,
} from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/constants';
import { useVirtualizationFeaturesContext } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/VirtualizationFeaturesContext';
import ConfigurationStepHeader from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/ConfigurationStep/components/ConfigurationStepHeader/ConfigurationStepHeader';
import LoadBalanceConfigurationSection from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/ConfigurationStep/components/LoadBalanceConfigurationSection/LoadBalanceConfigurationSection';
import VirtFeatureConfigurationItem from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/ConfigurationStep/components/VirtFeatureConfigurationItem/VirtFeatureConfigurationItem';

import HighAvailabilityConfigurationSection from './components/HighAvailabilityConfigurationSection/HighAvailabilityConfigurationSection';

import './ConfigurationStepContent.scss';

const ConfigurationStepContent: FCC = () => {
  const { t } = useKubevirtTranslation();
  const { operatorResourcesLoaded } = useVirtualizationFeaturesContext();

  if (!operatorResourcesLoaded) {
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }

  return (
    <Stack className="feature-wizard-configuration-step" hasGutter>
      <StackItem>
        <ConfigurationStepHeader />
      </StackItem>
      <StackItem className="feature-wizard-configuration-step__item-container">
        <VirtFeatureConfigurationItem
          description={t(
            'Delivers real-time, in-depth metrics and a fully functional Cluster Health Dashboard.',
          )}
          operatorName={CLUSTER_OBSERVABILITY_OPERATOR_NAME}
          title={t('Cluster observability')}
        />
      </StackItem>
      <hr />
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
