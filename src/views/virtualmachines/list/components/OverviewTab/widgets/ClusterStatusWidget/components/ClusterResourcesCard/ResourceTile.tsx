import React, { FC } from 'react';

import { Card, CardBody, Skeleton, Split, SplitItem } from '@patternfly/react-core';

import './ClusterResourcesCard.scss';

type ResourceTileProps = {
  count: number;
  isLoading?: boolean;
  label: string;
};

const ResourceTile: FC<ResourceTileProps> = ({ count, isLoading, label }) => (
  <Card className="cluster-resources-card__tile">
    <CardBody className="cluster-resources-card__tile-body">
      <Split className="cluster-resources-card__tile-split" hasGutter>
        <SplitItem className="cluster-resources-card__tile-label">{label}</SplitItem>
        <SplitItem className="cluster-resources-card__tile-count" isFilled>
          {isLoading ? <Skeleton width="50%" /> : count}
        </SplitItem>
      </Split>
    </CardBody>
  </Card>
);

export default ResourceTile;
