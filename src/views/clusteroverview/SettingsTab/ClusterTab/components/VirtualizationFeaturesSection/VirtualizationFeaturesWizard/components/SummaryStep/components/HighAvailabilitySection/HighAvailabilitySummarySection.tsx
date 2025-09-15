import React, { FC } from 'react';

import ExpandSectionWithCustomToggle from '@kubevirt-utils/components/ExpandSectionWithCustomToggle/ExpandSectionWithCustomToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  FENCE_AGENTS_OPERATOR_NAME,
  NODE_HEALTH_OPERATOR_NAME,
} from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/constants';
import { OperatorDetailsMap } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/hooks/useVirtualizationOperators/utils/types';
import FeatureSummaryItem from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/SummaryStep/components/FeatureSummaryItem/FeatureSummaryItem';
import { getHighAvailabilityInstallState } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/SummaryStep/components/HighAvailabilitySection/utils/utils';
import SummaryStatusIcon from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/SummaryStep/components/SummaryStatusIcon/SummaryStatusIcon';
import { Stack, StackItem } from '@patternfly/react-core';

import './HighAvailabilitySummarySection.scss';

type HighAvailabilitySummarySectionProps = {
  operatorDetailsMap: OperatorDetailsMap;
};

const HighAvailabilitySummarySection: FC<HighAvailabilitySummarySectionProps> = ({
  operatorDetailsMap,
}) => {
  const { t } = useKubevirtTranslation();

  const { installState: nhcInstallState } = operatorDetailsMap?.[NODE_HEALTH_OPERATOR_NAME];
  const { installState: farInstallState } = operatorDetailsMap?.[FENCE_AGENTS_OPERATOR_NAME];
  const jointInstallState = getHighAvailabilityInstallState(nhcInstallState, farInstallState);

  return (
    <ExpandSectionWithCustomToggle
      customContent={<SummaryStatusIcon computedInstallState={jointInstallState} />}
      id="high-availability-summary-section"
      toggleClassname="high-availability-summary-section__toggle"
      toggleContent={t('High availability')}
    >
      <Stack className="pf-v6-u-pl-xl" hasGutter>
        <StackItem>
          <FeatureSummaryItem
            isIndented
            operatorLabel={t('Node Health Check (NHC)')}
            operatorName={NODE_HEALTH_OPERATOR_NAME}
          />
        </StackItem>
        <StackItem>
          <FeatureSummaryItem
            isIndented
            operatorLabel={t('Fence Agents Remediation (FAR)')}
            operatorName={FENCE_AGENTS_OPERATOR_NAME}
          />
        </StackItem>
      </Stack>
    </ExpandSectionWithCustomToggle>
  );
};

export default HighAvailabilitySummarySection;
