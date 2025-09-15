import React, { FC } from 'react';
import classNames from 'classnames';

import { VirtualizationFeatureOperators } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/types';
import SummaryStatusIcon from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/SummaryStep/components/SummaryStatusIcon/SummaryStatusIcon';
import { Split, SplitItem } from '@patternfly/react-core';

import './FeatureSummaryItem.scss';

type FeatureSummaryItemProps = {
  isIndented?: boolean;
  operatorLabel: string;
  operatorName: VirtualizationFeatureOperators;
};

const FeatureSummaryItem: FC<FeatureSummaryItemProps> = ({
  isIndented,
  operatorLabel,
  operatorName,
}) => (
  <Split className="feature-summary-item">
    <SplitItem
      className={classNames(
        isIndented ? 'feature-summary-item__name--indented' : 'feature-summary-item__name',
      )}
    >
      {operatorLabel}
    </SplitItem>
    <SplitItem>
      <SummaryStatusIcon operatorName={operatorName} />
    </SplitItem>
  </Split>
);

export default FeatureSummaryItem;
