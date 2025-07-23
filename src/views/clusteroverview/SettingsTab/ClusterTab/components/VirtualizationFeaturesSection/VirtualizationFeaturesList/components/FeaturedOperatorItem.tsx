import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import { VirtualizationFeatureOperators } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/types';
import { useVirtualizationFeaturesContext } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/VirtualizationFeaturesContext';
import { getInstallStateIcon } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesList/utils/utils';
import { Button, Split, SplitItem } from '@patternfly/react-core';

import './FeaturedOperatorItem.scss';

type FeaturedOperatorItemProps = {
  operatorName: VirtualizationFeatureOperators;
  title: string;
};

const FeaturedOperatorItem: FC<FeaturedOperatorItemProps> = ({ operatorName, title }) => {
  const navigate = useNavigate();
  const { operatorDetailsMap } = useVirtualizationFeaturesContext();
  const { installState, operatorHubURL } = operatorDetailsMap?.[operatorName];
  const Icon = getInstallStateIcon(installState);

  return (
    <Split className="featured-operator-item" hasGutter>
      <SplitItem>
        <Button onClick={() => navigate(operatorHubURL)} variant="link">
          {title}
        </Button>
      </SplitItem>
      <SplitItem className="featured-operator-item__icon-container">
        <Icon />
      </SplitItem>
    </Split>
  );
};

export default FeaturedOperatorItem;
