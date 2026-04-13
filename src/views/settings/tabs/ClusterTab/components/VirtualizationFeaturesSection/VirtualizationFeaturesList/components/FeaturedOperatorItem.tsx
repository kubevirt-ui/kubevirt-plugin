import React, { FC } from 'react';

import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Label, PopoverPosition, Split, SplitItem } from '@patternfly/react-core';
import { VirtualizationFeatureOperators } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/types';
import { getInstallStateIcon } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/utils';
import { useVirtualizationFeaturesContext } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/VirtualizationFeaturesContext/VirtualizationFeaturesContext';
import HelpTextTooltipContent from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/HelpTextTooltipContent/HelpTextTooltipContent';

import IconSkeleton from './icons/IconSkeleton/IconSkeleton';

import './FeaturedOperatorItem.scss';

type FeaturedOperatorItemProps = {
  helpBody: string;
  isNew?: boolean;
  operatorName: VirtualizationFeatureOperators;
  title: string;
};

const FeaturedOperatorItem: FC<FeaturedOperatorItemProps> = ({
  helpBody,
  isNew,
  operatorName,
  title,
}) => {
  const { t } = useKubevirtTranslation();
  const { operatorDetailsMap, operatorResourcesLoaded } = useVirtualizationFeaturesContext();
  const { installState } = operatorDetailsMap?.[operatorName] ?? {};
  const Icon = getInstallStateIcon(installState);

  return (
    <Split className="featured-operator-item" hasGutter>
      <SplitItem>
        <span className="featured-operator-item__title">
          {title}
          {isNew && (
            <Label className="pf-v6-u-ml-sm" color="blue" isCompact>
              {t('New')}
            </Label>
          )}
        </span>
      </SplitItem>
      <SplitItem className="featured-operator-item__help-icon-container" isFilled>
        <HelpTextIcon
          bodyContent={<HelpTextTooltipContent bodyText={helpBody} titleText={title} />}
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

export default FeaturedOperatorItem;
