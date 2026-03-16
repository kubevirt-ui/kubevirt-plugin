import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Split, SplitItem } from '@patternfly/react-core';
import SettingsLink from '@settings/context/SettingsLink';
import {
  FENCE_AGENTS_OPERATOR_NAME,
  NODE_HEALTH_OPERATOR_NAME,
} from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/constants';
import { getInstallStateIcon } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/utils';
import { useVirtualizationFeaturesContext } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/VirtualizationFeaturesContext';
import { getHighAvailabilityInstallState } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/SummaryStep/components/HighAvailabilitySection/utils/utils';

import IconSkeleton from '../icons/IconSkeleton/IconSkeleton';

import '../FeaturedOperatorItem.scss';

const HighAvailabilitySection: FC = () => {
  const { t } = useKubevirtTranslation();
  const { operatorDetailsMap, operatorResourcesLoaded } = useVirtualizationFeaturesContext();

  const { installState: nhcInstallState, operatorHubURL } =
    operatorDetailsMap?.[NODE_HEALTH_OPERATOR_NAME] || {};
  const { installState: farInstallState } = operatorDetailsMap?.[FENCE_AGENTS_OPERATOR_NAME] || {};

  const jointInstallState = getHighAvailabilityInstallState(nhcInstallState, farInstallState);
  const Icon = getInstallStateIcon(jointInstallState);

  return (
    <Split className="featured-operator-item" hasGutter>
      <SplitItem>
        {operatorResourcesLoaded && operatorHubURL ? (
          <SettingsLink
            className="featured-operator-item__link-button"
            isInline={false}
            to={operatorHubURL}
          >
            {t('High availability')}
          </SettingsLink>
        ) : (
          <span className="featured-operator-item__link-button">{t('High availability')}</span>
        )}
      </SplitItem>
      <SplitItem className="featured-operator-item__icon-container">
        {operatorResourcesLoaded ? <Icon /> : <IconSkeleton />}
      </SplitItem>
    </Split>
  );
};

export default HighAvailabilitySection;
