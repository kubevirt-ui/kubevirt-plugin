import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  DESCHEDULER_OPERATOR_NAME,
  NETOBSERV_OPERATOR_NAME,
  NMSTATE_OPERATOR_NAME,
  NODE_HEALTH_OPERATOR_NAME,
} from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/constants';
import { VirtualizationFeaturesContextProvider } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/VirtualizationFeaturesContext';
import FeaturedOperatorItem from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesList/components/FeaturedOperatorItem';
import ExpandSection from '@overview/SettingsTab/ExpandSection/ExpandSection';
import { Stack, StackItem } from '@patternfly/react-core';

import LoadBalanceSection from './components/LoadBalanceSection/LoadBalanceSection';

const VirtualizationFeaturesSection: FC = () => {
  const { t } = useKubevirtTranslation();

  return (
    <VirtualizationFeaturesContextProvider>
      <ExpandSection toggleText={t('Virtualization features')}>
        <Stack hasGutter>
          <StackItem isFilled>
            <FeaturedOperatorItem
              operatorName={NETOBSERV_OPERATOR_NAME}
              title={t('Network observability')}
            />
          </StackItem>
          <StackItem isFilled>
            <FeaturedOperatorItem
              operatorName={NMSTATE_OPERATOR_NAME}
              title={t('Host network management (NMState)')}
            />
          </StackItem>
          <StackItem isFilled>
            <FeaturedOperatorItem
              operatorName={NODE_HEALTH_OPERATOR_NAME}
              title={t('High availability')}
            />
          </StackItem>
          <StackItem isFilled>
            <LoadBalanceSection operatorName={DESCHEDULER_OPERATOR_NAME} />
          </StackItem>
        </Stack>
      </ExpandSection>
    </VirtualizationFeaturesContextProvider>
  );
};

export default VirtualizationFeaturesSection;
