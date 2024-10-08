import React, { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { OnFilterChange } from '@openshift-console/dynamic-plugin-sdk';
import { CardFooter, Grid, GridItem } from '@patternfly/react-core';

import { colorScale } from './constants';
import { ChartDataItem } from './MigrationsChartDonut';

type MigrationChartLegendProps = {
  legendItems: ChartDataItem[];
  onFilterChange: OnFilterChange;
};

const MigrationChartLegend: FC<MigrationChartLegendProps> = ({ legendItems, onFilterChange }) => {
  return (
    <CardFooter>
      <Grid>
        {legendItems?.map((item, index) => {
          const { x: status, y: statusCount } = item || {};
          return (
            <GridItem key={status} span={2}>
              <i
                className="fas fa-square"
                style={{ color: colorScale[index % colorScale.length] }}
              />{' '}
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
