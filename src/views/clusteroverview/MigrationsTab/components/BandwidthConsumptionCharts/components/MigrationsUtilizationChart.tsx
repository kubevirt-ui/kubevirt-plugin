import React, { FC } from 'react';

import useResponsiveCharts from '@kubevirt-utils/components/Charts/hooks/useResponsiveCharts';
import { Chart, ChartAxis, ChartLine, createContainer } from '@patternfly/react-charts';
import { GridItem } from '@patternfly/react-core';

import { ChartDataObject } from '../constants';

type MigrationsUtilizationChartProps = {
  chartData: ChartDataObject[];
  domain?: {
    x: [number, number];
    y: [number, number];
  };
  labels: any;
  tickFormat?: ((tick: any, index: number, ticks: any[]) => number | string) | any[];
  tickValues?: any[];
  title: string;
};

const MigrationsUtilizationChart: FC<MigrationsUtilizationChartProps> = ({
  chartData,
  domain = null,
  labels,
  tickFormat = (y) => y,
  tickValues = null,
  title,
}) => {
  const { height, width } = useResponsiveCharts();
  const CursorVoronoiContainer = createContainer('voronoi', 'cursor');

  return (
    <GridItem className="co-utilization-card__item">
      <div className="co-utilization-card__item-description">
        <h4>{title}</h4>
      </div>
      <div>
        <Chart
          containerComponent={
            <CursorVoronoiContainer
              activateData={false}
              cursorDimension="x"
              key={title}
              labels={labels}
              mouseFollowTooltips
              voronoiDimension="x"
            />
          }
          domain={domain}
          height={height}
          padding={{ bottom: 40, left: 80, right: 0, top: 40 }}
          scale={{ x: 'time', y: 'linear' }}
          width={width}
        >
          <ChartAxis
            axisComponent={<></>}
            dependentAxis
            showGrid
            tickFormat={tickFormat}
            tickValues={tickValues}
          />
          <ChartLine data={chartData} />
        </Chart>
      </div>
    </GridItem>
  );
};

export default MigrationsUtilizationChart;
