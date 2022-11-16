import * as React from 'react';
import { Link } from 'react-router-dom';

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
          const { x: status, y: statusCount, fill: color } = item || {};
          return (
            <GridItem span={2} key={status}>
              <i className="fas fa-square" style={{ color }} />{' '}
              <Link
                onClick={() => {
                  onFilterChange('status', { selected: [status], all: [status] });
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
