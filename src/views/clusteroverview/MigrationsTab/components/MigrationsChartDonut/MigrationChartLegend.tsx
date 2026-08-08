import React, { FC } from 'react';
import { Link } from 'react-router';

import { OnSetFilters } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { Flex, FlexItem } from '@patternfly/react-core';

import { MIGRATION_STATUS_FILTER_ID } from '../MigrationsTable/utils/constants';
import { colorScale } from './constants';
import { ChartDataItem } from './MigrationsChartDonut';

type MigrationChartLegendProps = {
  legendItems: ChartDataItem[];
  onSetFilters: OnSetFilters;
};

const MigrationChartLegend: FC<MigrationChartLegendProps> = ({ legendItems, onSetFilters }) => {
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
                onSetFilters({ [MIGRATION_STATUS_FILTER_ID]: [status] });
              }}
              to={`?${MIGRATION_STATUS_FILTER_ID}=${status}`}
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
