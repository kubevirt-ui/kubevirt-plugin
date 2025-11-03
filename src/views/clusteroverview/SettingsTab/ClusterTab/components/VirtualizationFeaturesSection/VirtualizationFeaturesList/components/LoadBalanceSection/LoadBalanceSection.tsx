import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import ExpandSectionWithCustomToggle from '@kubevirt-utils/components/ExpandSectionWithCustomToggle/ExpandSectionWithCustomToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { DESCHEDULER_OPERATORS_URL } from '@kubevirt-utils/resources/descheduler/constants';
import { DESCHEDULER_OPERATOR_NAME } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/constants';
import {
  getInstallStateIcon,
  isInstalled,
} from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/utils';
import { useVirtualizationFeaturesContext } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/VirtualizationFeaturesContext';
import DeschedulerSection from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesList/components/LoadBalanceSection/components/DeschedulerSection';
import { Button, Split, SplitItem } from '@patternfly/react-core';

import IconSkeleton from '../icons/IconSkeleton/IconSkeleton';

import './LoadBalanceSection.scss';

const LoadBalanceSection: FC = () => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const { operatorDetailsMap, operatorResourcesLoaded } = useVirtualizationFeaturesContext();
  const { installState, operatorHubURL } = operatorDetailsMap?.[DESCHEDULER_OPERATOR_NAME] || {};
  const Icon = getInstallStateIcon(installState);
  const isOperatorInstalled = isInstalled(installState);

  return (
    <ExpandSectionWithCustomToggle
      customContent={
        <Split className="load-balance-section__custom-content">
          <SplitItem className="load-balance-section__operator-hub-link" isFilled>
            <Button
              onClick={() =>
                navigate(isOperatorInstalled ? DESCHEDULER_OPERATORS_URL : operatorHubURL)
              }
              isInline
              variant="link"
            >
              {isOperatorInstalled ? t('View Descheduler Operator') : t('View in Operator hub')}
            </Button>
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
