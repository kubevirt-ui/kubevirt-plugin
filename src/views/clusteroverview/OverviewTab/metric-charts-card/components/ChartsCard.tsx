import React from 'react';

import { Grid, GridItem } from '@patternfly/react-core';

import { METRICS } from '../utils/constants';

import ChartCard from './ChartCard';

import './ChartsCard.scss';

const ChartsCard: React.FC = () => {
  return (
    <div className="metric-charts-card">
      <Grid hasGutter className="metric-charts-card__grid">
        {Object.values(METRICS)?.map((metric) => (
          <GridItem className="metric-charts-card__grid-item" key={metric}>
            <ChartCard metric={metric} />
          </GridItem>
        ))}
      </Grid>
    </div>
  );
};

export default ChartsCard;
