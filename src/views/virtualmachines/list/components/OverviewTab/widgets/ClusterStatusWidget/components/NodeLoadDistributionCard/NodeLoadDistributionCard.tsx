import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Skeleton } from '@patternfly/react-core';

import DistributionBarChart from '../../../shared/DistributionBarChart/DistributionBarChart';
import { useNodeLoadDistributionData } from '../../hooks/useNodeLoadDistributionData';
import TwoColumnCard from '../TwoColumnCard/TwoColumnCard';

import useDeschedulerDisplay from './useDeschedulerDisplay';

const NodeLoadDistributionCard: FC = () => {
  const { t } = useKubevirtTranslation();
  const { buckets, deschedulerLoaded, deschedulerStatus, distributionScore, items, loaded } =
    useNodeLoadDistributionData();
  const { icon, label } = useDeschedulerDisplay(deschedulerStatus);

  return (
    <TwoColumnCard
      bottomLeftContent={
        <div className="two-column-card__descheduler">
          <span className="two-column-card__descheduler-label">{t('Descheduler status')}</span>
          {!deschedulerLoaded ? (
            <Skeleton width="80px" />
          ) : (
            <>
              {icon}
              <span className="two-column-card__descheduler-value">{label}</span>
            </>
          )}
        </div>
      }
      leftContent={
        <DistributionBarChart
          buckets={buckets}
          title={t('Distribution score {{score}}', { score: distributionScore })}
        />
      }
      gridColumns="1fr 1fr"
      // TODO CNV-78882: Implement navigation to node load view and add ViewAllLink headerActions
      isLoading={!loaded}
      items={items}
      nameHeader={t('Node name')}
      scoreHeader={t('Load')}
      title={t('Node load distribution')}
    />
  );
};

export default NodeLoadDistributionCard;
