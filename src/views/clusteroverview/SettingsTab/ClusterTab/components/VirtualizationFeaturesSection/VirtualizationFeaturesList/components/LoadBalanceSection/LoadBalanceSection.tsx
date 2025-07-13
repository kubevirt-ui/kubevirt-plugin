import React, { FC } from 'react';

import ExpandSectionWithCustomToggle from '@kubevirt-utils/components/ExpandSectionWithCustomToggle/ExpandSectionWithCustomToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getInstallStateIcon } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/utils';
import { useVirtualizationFeaturesContext } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/VirtualizationFeaturesContext';
import DeschedulerSection from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesList/components/LoadBalanceSection/components/DeschedulerSection';
import { Split, SplitItem } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons';

import { VirtualizationFeatureOperators } from '../../../utils/types';
import IconSkeleton from '../icons/IconSkeleton/IconSkeleton';

import './LoadBalanceSection.scss';

type LoadBalanceSectionProps = {
  operatorName: VirtualizationFeatureOperators;
};

const LoadBalanceSection: FC<LoadBalanceSectionProps> = ({ operatorName }) => {
  const { t } = useKubevirtTranslation();
  const { operatorDetailsMap, operatorResourcesLoaded } = useVirtualizationFeaturesContext();
  const { installState, operatorHubURL } = operatorDetailsMap?.[operatorName];
  const Icon = getInstallStateIcon(installState);

  return (
    <ExpandSectionWithCustomToggle
      customContent={
        <Split className="load-balance-section__custom-content">
          <SplitItem className="load-balance-section__operator-hub-link" isFilled>
            <a href={operatorHubURL}>
              {t('View in Operator hub')}
              <ExternalLinkAltIcon className="load-balance-section__link-icon" />
            </a>
          </SplitItem>
          <SplitItem className="load-balance-section__install-state-icon">
            {operatorResourcesLoaded ? <Icon /> : <IconSkeleton />}
          </SplitItem>
        </Split>
      }
      id="load-balance-section"
      isIndented
      toggleContent={t('Load balance')}
    >
      <DeschedulerSection />
    </ExpandSectionWithCustomToggle>
  );
};

export default LoadBalanceSection;
