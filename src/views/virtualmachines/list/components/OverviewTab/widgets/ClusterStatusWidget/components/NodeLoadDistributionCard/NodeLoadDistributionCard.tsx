import React, { FC, useMemo } from 'react';

import { NodeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';
import useManagedClusterConsoleURLs from '@multicluster/hooks/useManagedClusterConsoleURLs';
import { buildSpokeConsoleUrl } from '@multicluster/urls';
import { Skeleton } from '@patternfly/react-core';

import DistributionBarChart from '../../../shared/DistributionBarChart/DistributionBarChart';
import ViewAllLink from '../../../shared/ViewAllLink';
import { TOP_N } from '../../hooks/clusterMetricConstants';
import { useNodeLoadDistributionData } from '../../hooks/useNodeLoadDistributionData';
import TwoColumnCard from '../TwoColumnCard/TwoColumnCard';

import useDeschedulerDisplay from './useDeschedulerDisplay';

type NodeLoadDistributionCardProps = {
  cluster?: string;
};

const NODES_PATH = `${getResourceUrl({ model: NodeModel })}?roles=worker`;

const NodeLoadDistributionCard: FC<NodeLoadDistributionCardProps> = ({ cluster }) => {
  const { t } = useKubevirtTranslation();
  const {
    buckets,
    deschedulerLoaded,
    deschedulerStatus,
    distributionScore,
    items,
    loaded,
    totalNodeCount,
  } = useNodeLoadDistributionData(cluster);
  const { icon, label } = useDeschedulerDisplay(deschedulerStatus);
  const { isSpokeCluster, spokeConsoleURL } = useManagedClusterConsoleURLs(cluster);

  const { nodesHref, nodesLinkPath } = useMemo(() => {
    if (isSpokeCluster) {
      return {
        nodesHref: buildSpokeConsoleUrl(spokeConsoleURL, NODES_PATH),
        nodesLinkPath: undefined,
      };
    }
    return { nodesHref: undefined, nodesLinkPath: NODES_PATH };
  }, [isSpokeCluster, spokeConsoleURL]);

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
          helpContent={t(
            'Measures how evenly the workload is spread across nodes. 100% means perfectly balanced, 0% means all load is concentrated on a few nodes.',
          )}
          buckets={buckets}
          title={t('Distribution score {{score}}%', { score: distributionScore })}
        />
      }
      rightTitle={
        totalNodeCount > TOP_N
          ? t('Top {{topNodesCount}} nodes by load', { topNodesCount: TOP_N })
          : t('Top nodes by load')
      }
      gridColumns="1fr 1fr"
      headerActions={<ViewAllLink href={nodesHref} linkPath={nodesLinkPath} />}
      isLoading={!loaded}
      items={items}
      nameHeader={t('Node name')}
      scoreHeader={t('Load')}
      title={t('Node load distribution')}
    />
  );
};

export default NodeLoadDistributionCard;
