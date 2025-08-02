import React, { Dispatch, FC, SetStateAction } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  FENCE_AGENTS_OPERATOR_NAME,
  NODE_HEALTH_OPERATOR_NAME,
} from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/constants';
import { VirtualizationFeatureOperators } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/types';
import HighAvailabilityFeatureItem from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/ConfigurationStep/components/HighAvailabilityConfigurationSection/components/HighAvailabilityContent/HighAvailabilityFeatureItem/HighAvailabilityFeatureItem';
import { HAAlternativeCheckedMap } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/ConfigurationStep/components/HighAvailabilityConfigurationSection/utils/types';
import { Stack, StackItem } from '@patternfly/react-core';

import './HighAvailabilityContent.scss';

type HighAvailabilitySectionProps = {
  alternativeCheckedMap: HAAlternativeCheckedMap;
  setAlternativeCheckedMap: Dispatch<SetStateAction<HAAlternativeCheckedMap>>;
};

const HighAvailabilityContent: FC<HighAvailabilitySectionProps> = ({
  alternativeCheckedMap,
  setAlternativeCheckedMap,
}) => {
  const { t } = useKubevirtTranslation();

  const handleAlternativeCheckedUpdate =
    (operatorName: VirtualizationFeatureOperators) => (newSwitchState: boolean) => {
      setAlternativeCheckedMap({ ...alternativeCheckedMap, [operatorName]: newSwitchState });
    };

  return (
    <Stack className="high-availability-section-content" hasGutter>
      <StackItem>
        <HighAvailabilityFeatureItem
          description={t(
            'Detect failed Nodes and trigger remediation with a remediation operator.',
          )}
          alternativeChecked={alternativeCheckedMap?.[NODE_HEALTH_OPERATOR_NAME]}
          checkboxLabel={t('Node health check (NHC)')}
          operatorName={NODE_HEALTH_OPERATOR_NAME}
          setAlternativeChecked={handleAlternativeCheckedUpdate(NODE_HEALTH_OPERATOR_NAME)}
        />
      </StackItem>
      <hr />
      <StackItem className="high-availability-section-content__fence-agents-row">
        <HighAvailabilityFeatureItem
          description={t(
            'The Fence Agents Remediation Operator uses well-known agents to fence and remediate unhealthy nodes.',
          )}
          alternativeChecked={alternativeCheckedMap?.[FENCE_AGENTS_OPERATOR_NAME]}
          checkboxLabel={t('Fence agents remediation (FAR)')}
          operatorName={FENCE_AGENTS_OPERATOR_NAME}
          setAlternativeChecked={handleAlternativeCheckedUpdate(FENCE_AGENTS_OPERATOR_NAME)}
        />
      </StackItem>
    </Stack>
  );
};

export default HighAvailabilityContent;
