import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import useAllClustersWorkerNodes from '../../hooks/useAllClustersWorkerNodes';

import ResourceTile from './ResourceTile';

import './ClusterResourcesCard.scss';

type AllClustersResourcesCardProps = {
  clustersCount: number;
  namespacesCount: number;
  vmsCount: number;
};

const AllClustersResourcesCard: FC<AllClustersResourcesCardProps> = ({
  clustersCount,
  namespacesCount,
  vmsCount,
}) => {
  const { t } = useKubevirtTranslation();
  const { loaded: nodesLoaded, nodesCount } = useAllClustersWorkerNodes();

  return (
    <div className="cluster-resources-card" data-test="cluster-resources-card">
      <ResourceTile count={clustersCount} label={t('Clusters')} />
      <ResourceTile count={nodesCount} isLoading={!nodesLoaded} label={t('Nodes')} />
      <ResourceTile count={namespacesCount} label={t('Namespaces')} />
      <ResourceTile count={vmsCount} label={t('VMs')} />
    </div>
  );
};

export default AllClustersResourcesCard;
