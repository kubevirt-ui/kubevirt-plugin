import React from 'react';

import {
  ChartDonutUtilization,
  ChartLabel,
} from '@patternfly/react-charts/dist/esm/victory/components';
import { Card, CardTitle, Flex, FlexItem, GridItem } from '@patternfly/react-core';

type StatusChartProps = {
  cardTitle: string;
  chartValue: string;
  color: string;
  limit: number;
  tooltipText: string;
  unit: string;
  used: number;
};

const StatusChart: React.FC<StatusChartProps> = ({
  cardTitle,
  chartValue,
  color,
  limit,
  tooltipText,
  unit,
  used,
}) => {
  const percentage = (used / limit) * 100;
  const subTitle = `of ${limit} ${unit} allocated`;
  const available = limit - used;

  return (
    <GridItem span={4}>
      <Card>
        <CardTitle className="pf-v6-u-text-align-center">{cardTitle}</CardTitle>
        <Flex justifyContent={{ default: 'justifyContentCenter' }} style={{ marginTop: '-16px' }}>
          <FlexItem className="pf-v6-u-my-sm">
            <ChartDonutUtilization
              data={{
                x: tooltipText,
                y: percentage,
              }}
              legendData={[
                { name: `${used} ${unit} used` },
                { name: `${available} ${unit} available` },
              ]}
              padding={{
                bottom: 75,
                left: 20,
                right: 20,
                top: 20,
              }}
              animate
              constrainToVisibleArea
              height={260}
              labels={({ datum }) => (datum.x ? `${datum.x}: ${chartValue}` : null)}
              legendOrientation="vertical"
              legendPosition="bottom"
              subTitle={subTitle}
              themeColor={color}
              title={chartValue}
              titleComponent={<ChartLabel style={[{ fontSize: '32px', fontWeight: 'bold' }, {}]} />}
              width={300}
            />
          </FlexItem>
        </Flex>
      </Card>
    </GridItem>
  );
};

export default StatusChart;
