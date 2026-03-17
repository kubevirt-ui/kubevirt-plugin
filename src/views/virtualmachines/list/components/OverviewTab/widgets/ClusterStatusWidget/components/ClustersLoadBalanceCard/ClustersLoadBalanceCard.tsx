import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { OLSPromptType } from '@lightspeed/utils/prompts';

import { TOP_N } from '../../hooks/clusterMetricConstants';
import useClustersLoadBalanceData from '../../hooks/useClustersLoadBalanceData';
import TwoColumnCard from '../TwoColumnCard/TwoColumnCard';

const ClustersLoadBalanceCard: FC = () => {
  const { t } = useKubevirtTranslation();
  const { items, loaded, severityCounts, totalCount } = useClustersLoadBalanceData();

  const rightTitle =
    totalCount > TOP_N
      ? t('Top {{clustersCount}} clusters by load', { clustersCount: TOP_N })
      : t('Top clusters by load');

  return (
    <TwoColumnCard
      helpContent={t('Load balance information across clusters.')}
      isLoading={!loaded}
      items={items}
      nameHeader={t('Cluster name')}
      olsPromptType={OLSPromptType.LOAD_BALANCE}
      rightTitle={rightTitle}
      scoreHeader={t('Score')}
      severityCounts={severityCounts}
      title={t('Clusters load balance')}
    />
  );
};

export default ClustersLoadBalanceCard;
