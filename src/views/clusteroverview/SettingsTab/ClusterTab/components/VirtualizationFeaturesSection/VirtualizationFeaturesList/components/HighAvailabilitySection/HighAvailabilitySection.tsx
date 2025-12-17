import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  FENCE_AGENTS_OPERATOR_NAME,
  NODE_HEALTH_OPERATOR_NAME,
} from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/constants';
import { getInstallStateIcon } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/utils';
import { useVirtualizationFeaturesContext } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/VirtualizationFeaturesContext';
import { getHighAvailabilityInstallState } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/SummaryStep/components/HighAvailabilitySection/utils/utils';
import { Button, Split, SplitItem } from '@patternfly/react-core';

import IconSkeleton from '../icons/IconSkeleton/IconSkeleton';

import '../FeaturedOperatorItem.scss';

const HighAvailabilitySection: FC = () => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const { operatorDetailsMap, operatorResourcesLoaded } = useVirtualizationFeaturesContext();

  const { installState: nhcInstallState, operatorHubURL } =
    operatorDetailsMap?.[NODE_HEALTH_OPERATOR_NAME] || {};
  const { installState: farInstallState } = operatorDetailsMap?.[FENCE_AGENTS_OPERATOR_NAME] || {};

  const jointInstallState = getHighAvailabilityInstallState(nhcInstallState, farInstallState);
  const Icon = getInstallStateIcon(jointInstallState);

  return (
    <Split className="featured-operator-item" hasGutter>
      <SplitItem>
        <Button
          className="featured-operator-item__link-button"
          onClick={() => navigate(operatorHubURL)}
          variant="link"
        >
          {t('High availability')}
        </Button>
      </SplitItem>
      <SplitItem className="featured-operator-item__icon-container">
        {operatorResourcesLoaded ? <Icon /> : <IconSkeleton />}
      </SplitItem>
    </Split>
  );
};

export default HighAvailabilitySection;
