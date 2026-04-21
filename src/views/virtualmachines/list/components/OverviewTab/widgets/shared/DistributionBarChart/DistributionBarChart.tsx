import React, { FC, ReactNode } from 'react';

import useResponsiveCharts from '@kubevirt-utils/components/Charts/hooks/useResponsiveCharts';
import HelpTextIcon from '@kubevirt-utils/components/HelpTextIcon/HelpTextIcon';
import { Chart, ChartAxis, ChartBar } from '@patternfly/react-charts/victory';
import { Skeleton } from '@patternfly/react-core';
import chart_color_black_200 from '@patternfly/react-tokens/dist/esm/chart_color_black_200';

import { CHART_FONT_SIZE } from '../chartConstants';

import './DistributionBarChart.scss';

export type DistributionBucket = {
  color: string;
  label: string;
  value: number;
};

type DistributionBarChartProps = {
  buckets: DistributionBucket[];
  helpContent?: ReactNode;
  isLoading?: boolean;
  title: string;
};

const DistributionBarChart: FC<DistributionBarChartProps> = ({
  buckets,
  helpContent,
  isLoading,
  title,
}) => {
  const { height, ref, width } = useResponsiveCharts();

  const safeBuckets = buckets ?? [];
  const maxValue = Math.max(...safeBuckets.map((b) => b.value), 1);
  const yTickMax = Math.ceil(maxValue / 20) * 20;

  const chartData = safeBuckets.map((bucket, index) => ({
    fill: bucket.color,
    key: index,
    x: bucket.label,
    y: bucket.value,
  }));

  return (
    <div className="distribution-bar-chart">
      <div className="distribution-bar-chart__title">
        {title}
        {helpContent && <HelpTextIcon bodyContent={helpContent} />}
      </div>
      <div aria-label={title} className="distribution-bar-chart__chart" ref={ref} role="img">
        {isLoading ? (
          <Skeleton height="100%" width="100%" />
        ) : (
          width > 0 && (
            <Chart
              domain={{ y: [0, yTickMax] }}
              domainPadding={{ x: 30 }}
              height={height}
              padding={{ bottom: 35, left: 40, right: 10, top: 25 }}
              width={width}
            >
              <ChartAxis
                style={{
                  tickLabels: { fontSize: CHART_FONT_SIZE },
                }}
              />
              <ChartAxis
                style={{
                  grid: { stroke: chart_color_black_200.value },
                  tickLabels: { fontSize: CHART_FONT_SIZE },
                }}
                axisComponent={<></>}
                dependentAxis
                tickCount={5}
              />
              <ChartBar
                style={{
                  data: { fill: ({ datum }) => datum.fill, width: 25 },
                  labels: { fontSize: CHART_FONT_SIZE, fontWeight: 'bold' },
                }}
                data={chartData}
                labels={({ datum }) => datum.y}
              />
            </Chart>
          )
        )}
      </div>
    </div>
  );
};

export default DistributionBarChart;
