import React, { FCC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useResourcesQuantities from '@overview/OverviewTab/resources-inventory-card/hooks/useResourcesQuantities';

import ResourceTile from './ResourceTile';

import './ClusterResourcesCard.scss';

type SingleClusterResourcesCardProps = {
  projectsCount: number;
  vmsCount: number;
};

const SingleClusterResourcesCard: FCC<SingleClusterResourcesCardProps> = ({
  projectsCount,
  vmsCount,
}) => {
  const { t } = useKubevirtTranslation();
  const { loaded: nodesLoaded, nodes: nodesCount } = useResourcesQuantities();

  return (
    <div className="cluster-resources-card" data-test="cluster-resources-card">
      <div
        aria-hidden="true"
        className="cluster-resources-card__tile cluster-resources-card__tile--placeholder"
      />
      <ResourceTile count={nodesCount} isLoading={!nodesLoaded} label={t('Nodes')} />
      <ResourceTile count={projectsCount} label={t('Projects')} />
      <ResourceTile count={vmsCount} label={t('VMs')} />
    </div>
  );
};

export default SingleClusterResourcesCard;
