import React, { type FC } from 'react';

import { type OnSetFilters } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { Button, Flex, FlexItem } from '@patternfly/react-core';

import { MIGRATION_STATUS_FILTER_ID } from '../MigrationsTable/utils/constants';
import { type ChartDataItem } from './utils';

type MigrationChartLegendProps = {
  legendItems: ChartDataItem[];
  onSetFilters: OnSetFilters;
};

const MigrationChartLegend: FC<MigrationChartLegendProps> = ({ legendItems, onSetFilters }) => {
  return (
    <Flex gap={{ default: 'gapMd' }}>
      {legendItems?.map((item) => {
        const { fill, x: status, y: statusCount } = item || {};
        return (
          <FlexItem key={status} style={{ whiteSpace: 'nowrap' }}>
            <i
              aria-hidden="true"
              className="fas fa-square"
              data-test={`migration-legend-swatch-${status}`}
              style={{ color: fill }}
            />{' '}
            <Button
              isInline
              onClick={() => onSetFilters({ [MIGRATION_STATUS_FILTER_ID]: [status] })}
              variant="link"
            >
              {statusCount} {status}
            </Button>
          </FlexItem>
        );
      })}
    </Flex>
  );
};

export default MigrationChartLegend;
