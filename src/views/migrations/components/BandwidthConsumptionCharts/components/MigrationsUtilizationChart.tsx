import { type FC } from 'react';

import { tickLabels } from '@kubevirt-utils/components/Charts/ChartLabels/styleOverrides';
import useResponsiveCharts from '@kubevirt-utils/components/Charts/hooks/useResponsiveCharts';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Chart, ChartAxis, ChartLine, createContainer } from '@patternfly/react-charts/victory';
import { HelperText, HelperTextItem } from '@patternfly/react-core';

import { type ChartDataObject, MIGRATIONS_OVERVIEW_CHART_HEIGHT } from '../constants';
import { MIGRATIONS_OVERVIEW_CHART_PADDING } from '../overviewChartUtils';

const overviewTickLabels = { ...tickLabels, fontSize: 12 };

const overviewGrid = {
  stroke: 'var(--pf-t--global--border--color--default)',
  strokeDasharray: '4, 4',
};

type MigrationsUtilizationChartProps = {
  chartData: ChartDataObject[];
  chartHeight?: number;
  domain?: {
    x: [number, number];
    y: [number, number];
  };
  labels: (prop: { datum: { idx: number; x: Date | number } }) => string;
  tickFormat?: (tick: number, index: number, ticks: number[]) => number | string;
  tickValues?: number[];
  title: string;
  yAxisUnit?: string;
};

const CursorVoronoiContainer = createContainer('voronoi', 'cursor');

const MigrationsUtilizationChart: FC<MigrationsUtilizationChartProps> = ({
  chartData,
  chartHeight = MIGRATIONS_OVERVIEW_CHART_HEIGHT,
  domain = null,
  labels,
  tickFormat = (yValue: number): number => yValue,
  tickValues = null,
  title,
  yAxisUnit,
}) => {
  const { t } = useKubevirtTranslation();
  const { ref, width } = useResponsiveCharts();
  const chartWidth = width && width > 0 ? width : undefined;

  return (
    <div className="migrations-bandwidth-charts__item" ref={ref}>
      <div className="migrations-bandwidth-charts__header">
        <div className="migrations-bandwidth-charts__title">{title}</div>
        {yAxisUnit && <span className="migrations-bandwidth-charts__unit">{yAxisUnit}</span>}
      </div>
      {isEmpty(chartData) ? (
        <HelperText>
          <HelperTextItem variant="warning">{t('No datapoints found')}</HelperTextItem>
        </HelperText>
      ) : (
        <div className="migrations-bandwidth-charts__chart">
          {chartWidth && (
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
              height={chartHeight}
              padding={MIGRATIONS_OVERVIEW_CHART_PADDING}
              scale={{ x: 'time', y: 'linear' }}
              width={chartWidth}
            >
              <ChartAxis
                axisComponent={<></>}
                dependentAxis
                showGrid
                style={{
                  axis: { stroke: 'transparent' },
                  grid: overviewGrid,
                  tickLabels: overviewTickLabels,
                  ticks: { stroke: 'transparent' },
                }}
                tickFormat={tickFormat}
                tickValues={tickValues}
              />
              <ChartAxis
                style={{
                  axis: { stroke: 'transparent' },
                  tickLabels: { fill: 'none' },
                  ticks: { stroke: 'transparent' },
                }}
                tickFormat={() => ''}
              />
              <ChartLine data={chartData} style={{ data: { strokeWidth: 2 } }} />
            </Chart>
          )}
        </div>
      )}
    </div>
  );
};

export default MigrationsUtilizationChart;
