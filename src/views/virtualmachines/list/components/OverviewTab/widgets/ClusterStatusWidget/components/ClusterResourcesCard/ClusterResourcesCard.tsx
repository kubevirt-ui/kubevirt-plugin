import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useResourcesQuantities from '@overview/OverviewTab/resources-inventory-card/hooks/useResourcesQuantities';

import ResourceTile from './ResourceTile';

import './ClusterResourcesCard.scss';

type ClusterResourcesCardProps = {
  clustersCount?: number;
  isAllClustersPage: boolean;
  projectsCount: number;
  vmsCount: number;
};

const ClusterResourcesCard: FC<ClusterResourcesCardProps> = ({
  clustersCount,
  isAllClustersPage,
  projectsCount,
  vmsCount,
}) => {
  const { t } = useKubevirtTranslation();
  const { loaded: nodesLoaded, nodes: nodesCount } = useResourcesQuantities();

  return (
    <div className="cluster-resources-card" data-test="cluster-resources-card">
      {isAllClustersPage && <ResourceTile count={clustersCount || 0} label={t('Clusters')} />}
      <ResourceTile count={nodesCount} isLoading={!nodesLoaded} label={t('Nodes')} />
      {!isAllClustersPage && (
        <div
          aria-hidden="true"
          className="cluster-resources-card__tile cluster-resources-card__tile--placeholder"
        />
      )}
      <ResourceTile count={projectsCount} label={t('Projects')} />
      <ResourceTile count={vmsCount} label={t('VMs')} />
    </div>
  );
};

export default ClusterResourcesCard;
