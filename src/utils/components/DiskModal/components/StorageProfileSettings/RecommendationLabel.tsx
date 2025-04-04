import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Label, Tooltip } from '@patternfly/react-core';

type RecommendationLabelProps = {
  priority: number;
  recommendationCount: number;
};

const tooltipForOtherRecommended = (priority: number, t) => {
  switch (priority) {
    case 1:
      return t('The 2nd most suggested option in StorageProfile.');
    case 2:
      return t('The 3rd most suggested option in StorageProfile.');
    default:
      return t('The {{priority}}th most suggested option in StorageProfile.', {
        priority: priority + 1,
      });
  }
};

const fromPriorityToLabels = (priority, recommendationCount, t) => {
  if (priority === 0) {
    return {
      className: 'pf-m-success',
      label: t('Highly recommended'),
      tooltip: t('The most suggested StorageProfile option.'),
    };
  }

  if (priority > 0 && priority < recommendationCount) {
    return {
      label: t('Recommended'),
      tooltip: tooltipForOtherRecommended(priority, t),
    };
  }

  return {
    className: 'pf-m-warning',
    label: t('Not recommended'),
    tooltip: t('We suggest using another option.'),
  };
};

const RecommendationLabel: FC<RecommendationLabelProps> = ({ priority, recommendationCount }) => {
  const { t } = useKubevirtTranslation();
  const { className, label, tooltip } = fromPriorityToLabels(priority, recommendationCount, t);

  return (
    <Tooltip content={tooltip}>
      <Label className={className} isCompact variant="outline">
        {label}
      </Label>
    </Tooltip>
  );
};

export default RecommendationLabel;
