import React, { FCC } from 'react';

import AllClustersResourcesCard from './AllClustersResourcesCard';
import SingleClusterResourcesCard from './SingleClusterResourcesCard';

import './ClusterResourcesCard.scss';

type ClusterResourcesCardProps = {
  clustersCount?: number;
  isAllClustersPage: boolean;
  projectsCount: number;
  vmsCount: number;
};

const ClusterResourcesCard: FCC<ClusterResourcesCardProps> = ({
  clustersCount,
  isAllClustersPage,
  projectsCount,
  vmsCount,
}) => {
  if (isAllClustersPage) {
    return (
      <AllClustersResourcesCard
        clustersCount={clustersCount || 0}
        projectsCount={projectsCount}
        vmsCount={vmsCount}
      />
    );
  }

  return <SingleClusterResourcesCard projectsCount={projectsCount} vmsCount={vmsCount} />;
};

export default ClusterResourcesCard;
