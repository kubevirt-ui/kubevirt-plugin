import React, { FC } from 'react';
import classNames from 'classnames';

import { Split, SplitItem } from '@patternfly/react-core';
import { VirtualizationFeatureOperators } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/types';
import { useVirtualizationFeaturesContext } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/VirtualizationFeaturesContext';
import SummaryStatusIcon from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/SummaryStep/components/SummaryStatusIcon/SummaryStatusIcon';

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
}) => {
  const { operatorDetailsMap } = useVirtualizationFeaturesContext();
  const { installState, operatorHubURL } = operatorDetailsMap[operatorName];

  return (
    <Split className="feature-summary-item">
      <SplitItem
        className={classNames(
          isIndented ? 'feature-summary-item__name--indented' : 'feature-summary-item__name',
        )}
      >
        {operatorLabel}
      </SplitItem>
      <SplitItem>
        <SummaryStatusIcon installState={installState} operatorHubURL={operatorHubURL} />
      </SplitItem>
    </Split>
  );
};

export default FeatureSummaryItem;
