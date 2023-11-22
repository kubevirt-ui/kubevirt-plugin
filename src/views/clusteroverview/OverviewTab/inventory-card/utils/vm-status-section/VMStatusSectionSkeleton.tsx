import * as React from 'react';

import { Flex, Grid, GridItem, Skeleton } from '@patternfly/react-core';

import './VMStatusSectionSkeleton.scss';

const VMStatusSectionSkeleton: React.FC = () => (
  <Grid
    className="kv-inventory-card__statuses-grid kv-inventory-card__statuses-grid--skeleton-box"
    hasGutter
  >
    <GridItem className="kv-inventory-card__statuses-grid--left-col" span={6}>
      <Flex direction={{ default: 'column' }}>
        <span className="kv-inventory-card__status-skeleton-container">
          <Skeleton width={'200px'} />
        </span>
        <span className="kv-inventory-card__status-skeleton-container">
          <Skeleton width={'200px'} />
        </span>
        <span className="kv-inventory-card__status-skeleton-container">
          <Skeleton width={'200px'} />
        </span>
      </Flex>
    </GridItem>
    <GridItem span={6}>
      <Flex direction={{ default: 'column' }}>
        <span className="kv-inventory-card__status-skeleton-container">
          <Skeleton width={'200px'} />
        </span>
        <span className="kv-inventory-card__status-skeleton-container">
          <Skeleton width={'200px'} />
        </span>
        <span className="kv-inventory-card__status-skeleton-container">
          <Skeleton width={'200px'} />
        </span>
      </Flex>
    </GridItem>
  </Grid>
);

export default VMStatusSectionSkeleton;
