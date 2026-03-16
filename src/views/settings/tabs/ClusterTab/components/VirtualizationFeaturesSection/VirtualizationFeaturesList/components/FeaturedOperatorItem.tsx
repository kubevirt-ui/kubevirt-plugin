import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Label, Split, SplitItem } from '@patternfly/react-core';
import SettingsLink from '@settings/context/SettingsLink';
import { VirtualizationFeatureOperators } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/types';
import { getInstallStateIcon } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/utils';
import { useVirtualizationFeaturesContext } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/VirtualizationFeaturesContext';

import IconSkeleton from './icons/IconSkeleton/IconSkeleton';

import './FeaturedOperatorItem.scss';

type FeaturedOperatorItemProps = {
  isNew?: boolean;
  operatorName: VirtualizationFeatureOperators;
  title: string;
};

const FeaturedOperatorItem: FC<FeaturedOperatorItemProps> = ({ isNew, operatorName, title }) => {
  const { t } = useKubevirtTranslation();
  const { operatorDetailsMap, operatorResourcesLoaded } = useVirtualizationFeaturesContext();
  const { installState, operatorHubURL } = operatorDetailsMap?.[operatorName] ?? {};
  const Icon = getInstallStateIcon(installState);

  return (
    <Split className="featured-operator-item" hasGutter>
      <SplitItem>
        <SettingsLink
          className="featured-operator-item__link-button"
          disabled={!operatorHubURL}
          isInline={false}
          to={operatorHubURL}
        >
          {title}
          {isNew && (
            <Label className="pf-v6-u-ml-sm" color="blue" isCompact>
              {t('New')}
            </Label>
          )}
        </SettingsLink>
      </SplitItem>
      <SplitItem className="featured-operator-item__icon-container">
        {operatorResourcesLoaded ? <Icon /> : <IconSkeleton />}
      </SplitItem>
    </Split>
  );
};

export default FeaturedOperatorItem;
