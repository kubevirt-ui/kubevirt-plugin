import type { FC } from 'react';
import React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ChartDonutUtilization,
  ChartLabel,
} from '@patternfly/react-charts/dist/esm/victory/components';
import { Card, CardTitle, Flex, FlexItem } from '@patternfly/react-core';

import { getStatusChartInfo } from '../utils';

import { STATUS_CHART_THRESHOLDS } from '../../utils/constants';

type StatusChartProps = {
  hard: string;
  resourceKey: string;
  used: string;
};

const StatusChart: FC<StatusChartProps> = ({ hard: maxValue, resourceKey, used: usedValue }) => {
  const { t } = useKubevirtTranslation();

  const { availableText, percentage, resourceLabel, subTitle, title, usedText } =
    getStatusChartInfo(resourceKey, usedValue, maxValue, t);

  return (
    <FlexItem grow={{ default: 'grow' }}>
      <Card>
        <CardTitle className="pf-v6-u-text-align-center">{resourceLabel}</CardTitle>
        <Flex justifyContent={{ default: 'justifyContentCenter' }} style={{ marginTop: '-16px' }}>
          <FlexItem className="pf-v6-u-my-sm">
            <ChartDonutUtilization
              animate
              constrainToVisibleArea
              data={{
                x: resourceLabel,
                y: percentage > 100 ? 100 : percentage,
              }}
              height={260}
              labels={({ datum }) => (datum.x ? `${datum.x}: ${usedText}` : null)}
              legendData={[
                { name: t('{{usedText}} used', { usedText }) },
                { name: t('{{availableText}} available', { availableText }) },
              ]}
              legendOrientation="vertical"
              legendPosition="bottom"
              padding={{
                bottom: 75,
                top: 20,
              }}
              subTitle={subTitle}
              thresholds={STATUS_CHART_THRESHOLDS}
              title={title}
              titleComponent={<ChartLabel style={[{ fontSize: '32px', fontWeight: 'bold' }, {}]} />}
            />
          </FlexItem>
        </Flex>
      </Card>
    </FlexItem>
  );
};

export default StatusChart;
