import React, { FC } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  ChartDonutUtilization,
  ChartLabel,
} from '@patternfly/react-charts/dist/esm/victory/components';
import { Card, CardTitle, Flex, FlexItem } from '@patternfly/react-core';

import { STATUS_CHART_THRESHOLDS } from '../../utils/constants';
import { getStatusChartInfo } from '../utils';

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
              data={{
                x: resourceLabel,
                y: percentage > 100 ? 100 : percentage,
              }}
              legendData={[
                { name: t('{{usedText}} used', { usedText }) },
                { name: t('{{availableText}} available', { availableText }) },
              ]}
              padding={{
                bottom: 75,
                top: 20,
              }}
              animate
              constrainToVisibleArea
              height={260}
              labels={({ datum }) => (datum.x ? `${datum.x}: ${usedText}` : null)}
              legendOrientation="vertical"
              legendPosition="bottom"
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
