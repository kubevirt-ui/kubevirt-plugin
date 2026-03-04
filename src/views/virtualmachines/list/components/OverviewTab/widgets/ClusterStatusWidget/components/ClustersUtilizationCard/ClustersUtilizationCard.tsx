import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import useClustersUtilizationData from '../../hooks/useClustersUtilizationData';
import TwoColumnCard from '../TwoColumnCard/TwoColumnCard';

const ClustersUtilizationCard: FC = () => {
  const { t } = useKubevirtTranslation();
  const { items, loaded, severityCounts } = useClustersUtilizationData();

  return (
    <TwoColumnCard
      isLoading={!loaded}
      items={items}
      nameHeader={t('Cluster name')}
      scoreHeader={t('Score')}
      severityCounts={severityCounts}
      title={t('Clusters utilization')}
    />
  );
};

export default ClustersUtilizationCard;
