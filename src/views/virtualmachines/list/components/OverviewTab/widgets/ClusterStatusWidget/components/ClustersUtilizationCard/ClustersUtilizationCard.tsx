import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { TOP_N } from '../../hooks/clusterMetricConstants';
import useClustersUtilizationData from '../../hooks/useClustersUtilizationData';
import TwoColumnCard from '../TwoColumnCard/TwoColumnCard';

const ClustersUtilizationCard: FC = () => {
  const { t } = useKubevirtTranslation();
  const { items, loaded, severityCounts, totalCount } = useClustersUtilizationData();

  const rightTitle =
    totalCount > TOP_N
      ? t('Top {{clustersCount}} clusters by utilization', { clustersCount: TOP_N })
      : t('Top clusters by utilization');

  return (
    <TwoColumnCard
      isLoading={!loaded}
      items={items}
      nameHeader={t('Cluster name')}
      rightTitle={rightTitle}
      scoreHeader={t('Score')}
      severityCounts={severityCounts}
      title={t('Clusters utilization')}
    />
  );
};

export default ClustersUtilizationCard;
