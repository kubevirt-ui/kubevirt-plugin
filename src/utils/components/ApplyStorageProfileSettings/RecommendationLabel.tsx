import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Label, Tooltip } from '@patternfly/react-core';

import { fromPriorityToLabels } from './utils';

type RecommendationLabelProps = {
  priority: number;
  recommendationCount: number;
};

const RecommendationLabel: FC<RecommendationLabelProps> = ({ priority, recommendationCount }) => {
  const { t } = useKubevirtTranslation();
  const { className, label, tooltip } = fromPriorityToLabels(priority, recommendationCount, t);

  return (
    <Tooltip content={tooltip}>
      <Label className={className} isCompact>
        {label}
      </Label>
    </Tooltip>
  );
};

export default RecommendationLabel;
