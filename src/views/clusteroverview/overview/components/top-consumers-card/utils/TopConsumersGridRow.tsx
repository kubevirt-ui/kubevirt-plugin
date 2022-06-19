import * as React from 'react';
import classNames from 'classnames';

import { Grid, GridItem } from '@patternfly/react-core';

import TopConsumerCard from './TopConsumerCard';
import { getTopConsumerCardID } from './utils';

import './TopConsumersGridRow.scss';

type TopConsumersGridRowProps = {
  rowNumber: number;
  topGrid?: boolean;
};

const TopConsumersGridRow: React.FC<TopConsumersGridRowProps> = ({
  rowNumber,
  topGrid = false,
}) => {
  const classes = classNames('kv-top-consumers-card__grid', {
    'kv-top-consumers-card__top-grid': topGrid,
  });

  return (
    <Grid className={classes}>
      <GridItem span={4} className="kv-top-consumers-card__card-grid-item">
        <TopConsumerCard cardID={getTopConsumerCardID(rowNumber, 1)} />
      </GridItem>
      <GridItem span={4} className="kv-top-consumers-card__card-grid-item">
        <TopConsumerCard cardID={getTopConsumerCardID(rowNumber, 2)} />
      </GridItem>
      <GridItem span={4} className="kv-top-consumers-card__card-grid-item">
        <TopConsumerCard cardID={getTopConsumerCardID(rowNumber, 3)} />
      </GridItem>
    </Grid>
  );
};

export default TopConsumersGridRow;
