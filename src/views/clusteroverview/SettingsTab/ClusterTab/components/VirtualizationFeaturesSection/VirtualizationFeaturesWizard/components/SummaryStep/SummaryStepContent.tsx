import React, { FC, useEffect } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  CLUSTER_OBSERVABILITY_OPERATOR_NAME,
  DESCHEDULER_OPERATOR_NAME,
  NETOBSERV_OPERATOR_NAME,
  NMSTATE_OPERATOR_NAME,
} from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/constants';
import { useVirtualizationFeaturesContext } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/VirtualizationFeaturesContext';
import FeatureSummaryItem from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/SummaryStep/components/FeatureSummaryItem/FeatureSummaryItem';
import HighAvailabilitySummarySection from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/SummaryStep/components/HighAvailabilitySection/HighAvailabilitySummarySection';
import { Stack, StackItem, Title, TitleSizes } from '@patternfly/react-core';

import useCreateOperator from '../../utils/hooks/useCreateOperator/useCreateOperator';

const SummaryStepContent: FC = () => {
  const { t } = useKubevirtTranslation();
  const { operatorDetailsMap, operatorsToInstall } = useVirtualizationFeaturesContext();
  const { createOperators, createOperatorsResourcesLoaded } = useCreateOperator();

  useEffect(() => {
    if (createOperatorsResourcesLoaded && !isEmpty(operatorDetailsMap)) {
      createOperators(operatorsToInstall);
    }
  }, [createOperatorsResourcesLoaded, operatorDetailsMap]);

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
