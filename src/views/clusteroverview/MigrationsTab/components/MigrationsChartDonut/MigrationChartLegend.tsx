import React, { FC } from 'react';
import { Link } from 'react-router-dom-v5-compat';

import { OnFilterChange } from '@openshift-console/dynamic-plugin-sdk';
import { Flex, FlexItem } from '@patternfly/react-core';

import { colorScale } from './constants';
import { ChartDataItem } from './MigrationsChartDonut';

type MigrationChartLegendProps = {
  legendItems: ChartDataItem[];
  onFilterChange: OnFilterChange;
};

const MigrationChartLegend: FC<MigrationChartLegendProps> = ({ legendItems, onFilterChange }) => {
  return (
    <Flex gap={{ default: 'gapMd' }}>
      {legendItems?.map((item, index) => {
        const { x: status, y: statusCount } = item || {};
        return (
          <FlexItem key={status} style={{ whiteSpace: 'nowrap' }}>
            <i
              aria-hidden="true"
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
          </FlexItem>
        );
      })}
    </Flex>
  );
};

export default MigrationChartLegend;
