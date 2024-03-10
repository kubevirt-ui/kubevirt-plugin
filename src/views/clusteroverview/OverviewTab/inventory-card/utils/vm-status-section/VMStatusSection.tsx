import * as React from 'react';
import classNames from 'classnames';

import { Flex, FlexItem, Grid, GridItem } from '@patternfly/react-core';

import { K8sResourceKind } from '../../../../utils/types';
import EmptyStateNoVMs from '../../../vms-per-resource-card/EmptyStateNoVMs';
import { getVMStatusCounts } from '../utils';

import VMStatusInventoryItem from './VMStatusInventoryItem';
import VMStatusSectionSkeleton from './VMStatusSectionSkeleton';

import './VMStatusSection.scss';

export type VMStatusSectionProps = {
  vms: K8sResourceKind[];
  vmsLoaded: boolean;
};

const VMStatusSection: React.FC<VMStatusSectionProps> = ({ vms, vmsLoaded }) => {
  const statusCounts = getVMStatusCounts(vms);

  const statusItems = [];
  for (const [key, value] of Object.entries(statusCounts)) {
    const status = key;
    const count = value as number;
    statusItems.push(
      <FlexItem key={key}>
        <VMStatusInventoryItem count={count} status={status} />
      </FlexItem>,
    );
  }

  const numStatuses = statusItems.length;
  const leftColumnStatusItems = statusItems.splice(Math.floor(statusItems.length / 2));

  if (!vmsLoaded) {
    return <VMStatusSectionSkeleton />;
  }

  if (numStatuses === 0) {
    return <EmptyStateNoVMs />;
  } else {
    return (
      <Grid className="kv-inventory-card__statuses-grid" hasGutter>
        <GridItem
          className={classNames({
            'kv-inventory-card__statuses-grid--left-col': numStatuses >= 2,
          })}
          span={6}
        >
          <Flex direction={{ default: 'column' }}>{leftColumnStatusItems}</Flex>
        </GridItem>
        <GridItem span={6}>
          <Flex direction={{ default: 'column' }}>{statusItems}</Flex>
        </GridItem>
      </Grid>
    );
  }
};

export default VMStatusSection;
