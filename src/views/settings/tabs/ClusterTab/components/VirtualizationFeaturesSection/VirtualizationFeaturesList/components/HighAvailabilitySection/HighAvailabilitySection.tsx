import React, { FC } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PopoverPosition, Split, SplitItem } from '@patternfly/react-core';
import {
  FENCE_AGENTS_OPERATOR_NAME,
  NODE_HEALTH_OPERATOR_NAME,
} from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/constants';
import { getInstallStateIcon } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/utils';
import { useVirtualizationFeaturesContext } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/VirtualizationFeaturesContext';
import HelpTextTooltipContent from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/HelpTextTooltipContent/HelpTextTooltipContent';
import { getHighAvailabilityInstallState } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/SummaryStep/components/HighAvailabilitySection/utils/utils';

import IconSkeleton from '../icons/IconSkeleton/IconSkeleton';

import '../FeaturedOperatorItem.scss';

const HighAvailabilitySection: FC = () => {
  const { t } = useKubevirtTranslation();
  const { operatorDetailsMap, operatorResourcesLoaded } = useVirtualizationFeaturesContext();

  const { installState: nhcInstallState } = operatorDetailsMap?.[NODE_HEALTH_OPERATOR_NAME] || {};
  const { installState: farInstallState } = operatorDetailsMap?.[FENCE_AGENTS_OPERATOR_NAME] || {};

  const jointInstallState = getHighAvailabilityInstallState(nhcInstallState, farInstallState);
  const Icon = getInstallStateIcon(jointInstallState);
  const haTitle = t('High availability');

  return (
    <Split className="featured-operator-item" hasGutter>
      <SplitItem>
        <span className="featured-operator-item__title">{haTitle}</span>
      </SplitItem>
      <SplitItem className="featured-operator-item__help-icon-container" isFilled>
        <HelpTextIcon
          bodyContent={
            <HelpTextTooltipContent
              bodyText={t(
                "The feature's availability is dependent on two required operators to be installed and enabled.",
              )}
              linkURL="https://access.redhat.com/articles/7057929"
              titleText={haTitle}
            />
          }
          helpIconClassName="featured-operator-item__help-icon"
          position={PopoverPosition.right}
        />
      </SplitItem>
      <SplitItem className="featured-operator-item__icon-container">
        {operatorResourcesLoaded ? <Icon /> : <IconSkeleton />}
      </SplitItem>
    </Split>
  );
};

export default HighAvailabilitySection;
