import React, { FC } from 'react';

import AllClustersResourcesCard from './AllClustersResourcesCard';
import SingleClusterResourcesCard from './SingleClusterResourcesCard';

import './ClusterResourcesCard.scss';

type ClusterResourcesCardProps = {
  clustersCount?: number;
  isAllClustersPage: boolean;
  namespacesCount: number;
  vmsCount: number;
};

const ClusterResourcesCard: FC<ClusterResourcesCardProps> = ({
  clustersCount,
  isAllClustersPage,
  namespacesCount,
  vmsCount,
}) => {
  if (isAllClustersPage) {
    return (
      <AllClustersResourcesCard
        clustersCount={clustersCount || 0}
        namespacesCount={namespacesCount}
        vmsCount={vmsCount}
      />
    );
  }

  return <SingleClusterResourcesCard namespacesCount={namespacesCount} vmsCount={vmsCount} />;
};

export default ClusterResourcesCard;
