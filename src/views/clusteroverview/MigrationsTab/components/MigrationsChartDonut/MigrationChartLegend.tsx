import * as React from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { OnFilterChange } from '@openshift-console/dynamic-plugin-sdk';
import { CardFooter, Grid, GridItem } from '@patternfly/react-core';

import './MigrationChartLegend';

import { ChartDataItem } from './MigrationsChartDonut';

type MigrationChartLegendProps = {
  legendItems: ChartDataItem[];
  onFilterChange: OnFilterChange;
};

const MigrationChartLegend: React.FC<MigrationChartLegendProps> = ({
  legendItems,
  onFilterChange,
}) => {
  return (
    <CardFooter>
      <Grid>
        {legendItems?.map((item) => {
          const { fill: color, x: status, y: statusCount } = item || {};
          return (
            <GridItem key={status} span={2}>
              <i className="fas fa-square" style={{ color }} />{' '}
              <Link
                onClick={() => {
                  onFilterChange('status', { all: [status], selected: [status] });
                }}
                to={`?rowFilter-status=${status}`}
              >
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
