import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { VirtualizationFeatureOperators } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/types';
import { getInstallStateIcon } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/utils';
import { useVirtualizationFeaturesContext } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/VirtualizationFeaturesContext';
import { Button, Label, Split, SplitItem } from '@patternfly/react-core';

import IconSkeleton from './icons/IconSkeleton/IconSkeleton';

import './FeaturedOperatorItem.scss';

type FeaturedOperatorItemProps = {
  isNew?: boolean;
  operatorName: VirtualizationFeatureOperators;
  title: string;
};

const FeaturedOperatorItem: FC<FeaturedOperatorItemProps> = ({ isNew, operatorName, title }) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const { operatorDetailsMap, operatorResourcesLoaded } = useVirtualizationFeaturesContext();
  const { installState, operatorHubURL } = operatorDetailsMap?.[operatorName];
  const Icon = getInstallStateIcon(installState);

  return (
    <Split className="featured-operator-item" hasGutter>
      <SplitItem>
        <Button
          className="featured-operator-item__link-button"
          onClick={() => navigate(operatorHubURL)}
          variant="link"
        >
          {title}
          {isNew && (
            <Label className="pf-v6-u-ml-sm" color="blue" isCompact>
              {t('New')}
            </Label>
          )}
        </Button>
      </SplitItem>
      <SplitItem className="featured-operator-item__icon-container">
        {operatorResourcesLoaded ? <Icon /> : <IconSkeleton />}
      </SplitItem>
    </Split>
  );
};

export default FeaturedOperatorItem;
