import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Icon, Label, Tooltip } from '@patternfly/react-core';
import { ExclamationTriangleIcon, ThumbsUpIcon } from '@patternfly/react-icons';

type RecommendationLabelProps = {
  priority: number;
  recommendationCount: number;
};

const RecommendationLabel: FC<RecommendationLabelProps> = ({ priority, recommendationCount }) => {
  const { t } = useKubevirtTranslation();
  const labelsForRecommendations = [
    <Tooltip content={t('The most recommended option according to StorageProfile.')} key="1st">
      <Label icon={<ThumbsUpIcon />} isCompact status="success" variant="outline">
        {t('1st')}
      </Label>
    </Tooltip>,
    <Tooltip content={t('Second most recommended option according to StorageProfile.')} key="2nd">
      <Label isCompact variant="outline">
        {t('2nd')}
      </Label>
    </Tooltip>,
    <Tooltip content={t('Third most recommended option according to StorageProfile.')} key="3rd">
      <Label isCompact variant="outline">
        {t('3rd')}
      </Label>
    </Tooltip>,
  ];

  const notRecommendedLabel = (
    <Tooltip content={t('The option is not recommended according to StorageProfile.')}>
      <Icon status="warning">
        <ExclamationTriangleIcon />
      </Icon>
    </Tooltip>
  );

  if (priority < 0 || priority > recommendationCount - 1) {
    return notRecommendedLabel;
  }
  if (priority >= labelsForRecommendations.length) {
    return null;
  }
  return labelsForRecommendations[priority];
};

export default RecommendationLabel;
