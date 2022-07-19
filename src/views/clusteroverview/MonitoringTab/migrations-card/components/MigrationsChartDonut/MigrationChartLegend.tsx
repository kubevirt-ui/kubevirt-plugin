import * as React from 'react';
import { Link } from 'react-router-dom';

import { CardFooter, Grid, GridItem } from '@patternfly/react-core';

import './MigrationChartLegend';

import { ChartDataItem } from './MigrationsChartDonut';

type MigrationChartLegendProps = {
  legendItems: ChartDataItem[];
};

const MigrationChartLegend: React.FC<MigrationChartLegendProps> = ({ legendItems }) => {
  return (
    <CardFooter>
      <Grid>
        {legendItems?.map((item) => {
          const { x: status, y: statusCount, fill: color } = item || {};
          return (
            <GridItem span={2} key={status}>
              <i className="fas fa-square" style={{ color }} />
              <Link to={`?rowFilter-status=${status}`}>
                {' '}
                {statusCount} {status}
              </Link>
            </GridItem>
          );
        })}
      </Grid>
    </CardFooter>
  );
};

export default MigrationChartLegend;
