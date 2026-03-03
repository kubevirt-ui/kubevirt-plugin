import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import useClustersLoadBalanceData from '../../hooks/useClustersLoadBalanceData';
import TwoColumnCard from '../TwoColumnCard/TwoColumnCard';

const ClustersLoadBalanceCard: FC = () => {
  const { t } = useKubevirtTranslation();
  const { items, loaded, severityCounts } = useClustersLoadBalanceData();

  return (
    <TwoColumnCard
      // TODO CNV-78882: Implement navigation to load balance view and add ViewAllLink headerActions
      helpContent={t('Load balance information across clusters.')}
      isLoading={!loaded}
      items={items}
      nameHeader={t('Cluster name')}
      scoreHeader={t('Score')}
      severityCounts={severityCounts}
      title={t('Clusters load balance')}
    />
  );
};

export default ClustersLoadBalanceCard;
