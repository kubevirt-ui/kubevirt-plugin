import React, { FC } from 'react';

import ExpandSectionWithCustomToggle from '@kubevirt-utils/components/ExpandSectionWithCustomToggle/ExpandSectionWithCustomToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useVirtualizationFeaturesContext } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/VirtualizationFeaturesContext';
import DeschedulerSection from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesList/components/LoadBalanceSection/components/DeschedulerSection';
import { getInstallStateIcon } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesList/utils/utils';
import { Split, SplitItem } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import { VirtualizationFeatureOperators } from '../../../utils/types';

import './LoadBalanceSection.scss';

type LoadBalanceSectionProps = {
  operatorName: VirtualizationFeatureOperators;
};

const LoadBalanceSection: FC<LoadBalanceSectionProps> = ({ operatorName }) => {
  const { t } = useKubevirtTranslation();
  const { operatorDetailsMap } = useVirtualizationFeaturesContext();
  const { installState, operatorHubURL } = operatorDetailsMap?.[operatorName];
  const Icon = getInstallStateIcon(installState);

  return (
    <ExpandSectionWithCustomToggle
      customContent={
        <Split className="load-balance-section__custom-content">
          <SplitItem className="load-balance-section__operator-hub-link" isFilled>
            <a href={operatorHubURL}>
              View in Operator hub
              <ExternalLinkAltIcon className="load-balance-section__link-icon" />
            </a>
          </SplitItem>
          <SplitItem className="load-balance-section__install-state-icon">
            <Icon />
          </SplitItem>
        </Split>
      }
      id="load-balance-section"
      toggleContent={t('Load balance')}
    >
      <DeschedulerSection />
    </ExpandSectionWithCustomToggle>
  );
};

export default LoadBalanceSection;
