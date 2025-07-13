import React, { FC } from 'react';

import { VirtualizationFeatureOperators } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/types';
import SummaryStatusIcon from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/SummaryStep/components/SummaryStatusIcon/SummaryStatusIcon';
import { Split, SplitItem } from '@patternfly/react-core';

import './FeatureSummaryItem.scss';

type FeatureSummaryItemProps = {
  iconClassName?: string;
  operatorLabel: string;
  operatorName: VirtualizationFeatureOperators;
};

const FeatureSummaryItem: FC<FeatureSummaryItemProps> = ({ iconClassName, operatorName }) => (
  <Split className="feature-summary-item">
    <SplitItem className="feature-summary-item__name">{operatorName}</SplitItem>
    <SplitItem>
      <SummaryStatusIcon iconClassName={iconClassName} operatorName={operatorName} />
    </SplitItem>
  </Split>
);

export default FeatureSummaryItem;
