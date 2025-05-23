import React, { FC } from 'react';

import { tickLabels } from '@kubevirt-utils/components/Charts/ChartLabels/styleOverrides';
import useResponsiveCharts from '@kubevirt-utils/components/Charts/hooks/useResponsiveCharts';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Chart, ChartAxis, ChartLine, createContainer } from '@patternfly/react-charts/victory';
import { GridItem, HelperText, HelperTextItem, Title } from '@patternfly/react-core';

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
  const { t } = useKubevirtTranslation();
  const { height, width } = useResponsiveCharts();
  const CursorVoronoiContainer = createContainer('voronoi', 'cursor');

  return (
    <GridItem className="co-utilization-card__item">
      <div className="co-utilization-card__item-description">
        <Title headingLevel="h4">{title}</Title>
      </div>
      {isEmpty(chartData) ? (
        <HelperText>
          <HelperTextItem variant="warning">{t('No Datapoints found')}</HelperTextItem>
        </HelperText>
      ) : (
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
              style={{ tickLabels }}
              tickFormat={tickFormat}
              tickValues={tickValues}
            />
            <ChartLine data={chartData} />
          </Chart>
        </div>
      )}
    </GridItem>
  );
};

export default MigrationsUtilizationChart;
