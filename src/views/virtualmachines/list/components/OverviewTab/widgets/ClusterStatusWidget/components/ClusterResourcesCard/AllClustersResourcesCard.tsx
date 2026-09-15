import type { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import useCanListNodes from '../../../../hooks/useCanListNodes';
import useAllClustersWorkerNodes from '../../hooks/useAllClustersWorkerNodes';
import ResourceTile from './ResourceTile';

import './ClusterResourcesCard.scss';

type AllClustersResourcesCardProps = {
  clustersCount: number;
  projectsCount: number;
  vmsCount: number;
};

const AllClustersResourcesCard: FC<AllClustersResourcesCardProps> = ({
  clustersCount,
  projectsCount,
  vmsCount,
}) => {
  const { t } = useKubevirtTranslation();
  const [canListNodes, accessReviewLoading] = useCanListNodes();
  const showNodesCount = accessReviewLoading || canListNodes;
  const { loaded: nodesLoaded, nodesCount } = useAllClustersWorkerNodes();

  return (
    <div className="cluster-resources-card" data-test="all-clusters-resources-card">
      <ResourceTile count={clustersCount} label={t('Clusters')} />
      {showNodesCount && (
        <ResourceTile count={nodesCount} isLoading={!nodesLoaded} label={t('Nodes')} />
      )}
      <ResourceTile count={projectsCount} label={t('Projects')} />
      <ResourceTile count={vmsCount} label={t('VMs')} />
    </div>
  );
};

export default AllClustersResourcesCard;
