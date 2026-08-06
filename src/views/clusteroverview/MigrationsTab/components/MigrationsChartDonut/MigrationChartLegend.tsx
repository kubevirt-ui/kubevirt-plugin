import React, { type FC } from 'react';

import { type OnSetFilters } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { Button, Flex, FlexItem } from '@patternfly/react-core';

import { MIGRATION_STATUS_FILTER_ID } from '../MigrationsTable/utils/constants';
import { colorScale } from './constants';
import { type ChartDataItem } from './MigrationsChartDonut';

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
