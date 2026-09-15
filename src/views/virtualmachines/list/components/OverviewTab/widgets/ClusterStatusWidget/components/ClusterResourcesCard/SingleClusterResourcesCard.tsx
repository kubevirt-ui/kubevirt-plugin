import { type FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import useCanListNodes from '../../../../hooks/useCanListNodes';
import useResourcesQuantities from '../../hooks/useResourcesQuantities';
import ResourceTile from './ResourceTile';

import './ClusterResourcesCard.scss';

type SingleClusterResourcesCardProps = {
  projectsCount: number;
  vmsCount: number;
};

const SingleClusterResourcesCard: FC<SingleClusterResourcesCardProps> = ({
  projectsCount,
  vmsCount,
}) => {
  const { t } = useKubevirtTranslation();
  const [canListNodes, accessReviewLoading] = useCanListNodes();
  const showNodesCount = accessReviewLoading || canListNodes;
  const { loaded: nodesLoaded, nodes: nodesCount } = useResourcesQuantities();

  return (
    <div className="cluster-resources-card" data-test="single-cluster-resources-card">
      <div
        aria-hidden="true"
        className="cluster-resources-card__tile cluster-resources-card__tile--placeholder"
      />
      {showNodesCount && (
        <ResourceTile count={nodesCount} isLoading={!nodesLoaded} label={t('Nodes')} />
      )}
      <ResourceTile count={projectsCount} label={t('Projects')} />
      <ResourceTile count={vmsCount} label={t('VMs')} />
    </div>
  );
};

export default SingleClusterResourcesCard;
