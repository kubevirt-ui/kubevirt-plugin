import React, { FCC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Bullseye, Spinner, Stack, StackItem, Title, TitleSizes } from '@patternfly/react-core';
import {
  CLUSTER_OBSERVABILITY_OPERATOR_NAME,
  DESCHEDULER_OPERATOR_NAME,
  NETOBSERV_OPERATOR_NAME,
  NMSTATE_OPERATOR_NAME,
} from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/constants';
import { useVirtualizationFeaturesContext } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/VirtualizationFeaturesContext';
import FeatureSummaryItem from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/SummaryStep/components/FeatureSummaryItem/FeatureSummaryItem';
import HighAvailabilitySummarySection from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/SummaryStep/components/HighAvailabilitySection/HighAvailabilitySummarySection';

import useCreateOperator from '../../utils/hooks/useCreateOperator/useCreateOperator';

const SummaryStepContent: FCC = () => {
  const { t } = useKubevirtTranslation();
  const { operatorDetailsMap, operatorResourcesLoaded } = useVirtualizationFeaturesContext();
  useCreateOperator();

  if (!operatorResourcesLoaded) {
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }

  return (
    <Stack hasGutter>
      <StackItem>
        <Title headingLevel="h1" size={TitleSizes.lg}>
          {t('Summary')}
        </Title>
      </StackItem>
      <StackItem>
        <FeatureSummaryItem
          operatorLabel={t('Cluster observability')}
          operatorName={CLUSTER_OBSERVABILITY_OPERATOR_NAME}
        />
      </StackItem>
      <StackItem>
        <FeatureSummaryItem
          operatorLabel={t('Network observability')}
          operatorName={NETOBSERV_OPERATOR_NAME}
        />
      </StackItem>
      <StackItem>
        <FeatureSummaryItem
          operatorLabel={t('Host network management (NMState)')}
          operatorName={NMSTATE_OPERATOR_NAME}
        />
      </StackItem>
      <StackItem>
        <HighAvailabilitySummarySection operatorDetailsMap={operatorDetailsMap} />
      </StackItem>
      <StackItem>
        <FeatureSummaryItem
          operatorLabel={t('Load balance')}
          operatorName={DESCHEDULER_OPERATOR_NAME}
        />
      </StackItem>
    </Stack>
  );
};

export default SummaryStepContent;
