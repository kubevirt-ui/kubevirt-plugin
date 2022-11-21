import React, { FC } from 'react';

import useResponsiveCharts from '@kubevirt-utils/components/Charts/hooks/useResponsiveCharts';
import { Chart, ChartAxis, ChartLine, createContainer } from '@patternfly/react-charts';
import { GridItem } from '@patternfly/react-core';

import { ChartDataObject } from '../constants';

type MigrationsUtilizationChartProps = {
  chartData: ChartDataObject[];
  labels: any;
  title: string;
  tickFormat?: any[] | ((tick: any, index: number, ticks: any[]) => string | number);
  tickValues?: any[];
  domain?: {
    x: [number, number];
    y: [number, number];
  };
};

const MigrationsUtilizationChart: FC<MigrationsUtilizationChartProps> = ({
  chartData,
  labels,
  title,
  tickFormat = (y) => y,
  tickValues = null,
  domain = null,
}) => {
  const { width, height } = useResponsiveCharts();
  const CursorVoronoiContainer = createContainer('voronoi', 'cursor');

  return (
    <GridItem className="co-utilization-card__item">
      <div className="co-utilization-card__item-description">
        <h4>{title}</h4>
      </div>
      <div>
        <Chart
          height={height}
          width={width}
          padding={{ top: 40, left: 80, bottom: 40, right: 0 }}
          scale={{ x: 'time', y: 'linear' }}
          domain={domain}
          containerComponent={
            <CursorVoronoiContainer
              activateData={false}
              cursorDimension="x"
              labels={labels}
              mouseFollowTooltips
              voronoiDimension="x"
              key={title}
            />
          }
        >
          <ChartAxis
            dependentAxis
            axisComponent={<></>}
            showGrid
            tickValues={tickValues}
            tickFormat={tickFormat}
          />
          <ChartLine data={chartData} />
        </Chart>
      </div>
    </GridItem>
  );
};

export default MigrationsUtilizationChart;
