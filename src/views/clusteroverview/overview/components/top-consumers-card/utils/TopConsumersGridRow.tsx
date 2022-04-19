import * as React from 'react';
import classNames from 'classnames';

import { Grid, GridItem } from '@patternfly/react-core';

import TopConsumerCard from './TopConsumerCard';
import { TopConsumerMetric } from './topConsumerMetric';

import './TopConsumersGridRow.scss';

type TopConsumersGridRowProps = {
  topGrid?: boolean;
  numItemsToShow: number;
  initialMetrics: TopConsumerMetric[];
};

const TopConsumersGridRow: React.FC<TopConsumersGridRowProps> = ({
  topGrid = false,
  numItemsToShow,
  initialMetrics,
}) => {
  const classes = classNames('kv-top-consumers-card__grid', {
    'kv-top-consumers-card__top-grid': topGrid,
  });

  return (
    <Grid className={classes}>
      <GridItem span={4} className="kv-top-consumers-card__card-grid-item">
        <TopConsumerCard numItemsToShow={numItemsToShow} initialMetric={initialMetrics[0]} />
      </GridItem>
      <GridItem span={4} className="kv-top-consumers-card__card-grid-item">
        <TopConsumerCard numItemsToShow={numItemsToShow} initialMetric={initialMetrics[1]} />
      </GridItem>
      <GridItem span={4} className="kv-top-consumers-card__card-grid-item">
        <TopConsumerCard numItemsToShow={numItemsToShow} initialMetric={initialMetrics[2]} />
      </GridItem>
    </Grid>
  );
};

export default TopConsumersGridRow;
