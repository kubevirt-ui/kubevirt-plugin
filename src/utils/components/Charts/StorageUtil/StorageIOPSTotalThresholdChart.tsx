import React from 'react';
import { Link } from 'react-router-dom';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { PrometheusEndpoint, usePrometheusPoll } from '@openshift-console/dynamic-plugin-sdk';
import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartGroup,
  ChartVoronoiContainer,
} from '@patternfly/react-charts';
import chart_color_black_200 from '@patternfly/react-tokens/dist/esm/chart_color_black_200';
import chart_color_blue_300 from '@patternfly/react-tokens/dist/esm/chart_color_blue_300';
import useDuration from '@virtualmachines/details/tabs/metrics/hooks/useDuration';

import ComponentReady from '../ComponentReady/ComponentReady';
import useResponsiveCharts from '../hooks/useResponsiveCharts';
import { getUtilizationQueries } from '../utils/queries';
import {
  findMaxYValue,
  MILLISECONDS_MULTIPLIER,
  queriesToLink,
  tickFormat,
  TICKS_COUNT,
} from '../utils/utils';

type StorageIOPSTotalThresholdChartProps = {
  vmi: V1VirtualMachineInstance;
};

const StorageIOPSTotalThresholdChart: React.FC<StorageIOPSTotalThresholdChartProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  const { currentTime, duration, timespan } = useDuration();
  const queries = React.useMemo(
    () => getUtilizationQueries({ duration, obj: vmi }),
    [vmi, duration],
  );
  const { height, ref, width } = useResponsiveCharts();

  const [data] = usePrometheusPoll({
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    endTime: currentTime,
    namespace: vmi?.metadata?.namespace,
    query: queries?.STORAGE_IOPS_TOTAL,
    timespan,
  });

  const storageWriteData = data?.data?.result?.[0]?.values;

  const chartData = storageWriteData?.map(([x, y]) => {
    return { x: new Date(x * MILLISECONDS_MULTIPLIER), y: Number(y) };
  });
  const yMax = findMaxYValue(chartData);

  return (
    <ComponentReady isReady={!isEmpty(chartData)}>
      <div className="util-threshold-chart" ref={ref}>
        <Link to={queriesToLink(queries?.STORAGE_IOPS_TOTAL)}>
          <Chart
            containerComponent={
              <ChartVoronoiContainer
                constrainToVisibleArea
                labels={({ datum }) => t('IOPS total: {{input}}', { input: datum?.y?.toFixed(2) })}
              />
            }
            domain={{
              x: [currentTime - timespan, currentTime],
              y: [0, yMax],
            }}
            height={height}
            padding={{ bottom: 35, left: 80, right: 35, top: 35 }}
            scale={{ x: 'time', y: 'linear' }}
            width={width}
          >
            <ChartAxis
              style={{
                grid: {
                  stroke: chart_color_black_200.value,
                },
              }}
              dependentAxis
              tickFormat={(tick: number) => `${tick === 0 ? tick : tick?.toFixed(2)} IOPS`}
              tickValues={[0, yMax]}
            />
            <ChartAxis
              style={{
                tickLabels: { padding: 2 },
                ticks: { stroke: 'transparent' },
              }}
              axisComponent={<></>}
              tickCount={TICKS_COUNT}
              tickFormat={tickFormat(duration, currentTime)}
            />
            <ChartGroup>
              <ChartArea
                style={{
                  data: {
                    stroke: chart_color_blue_300.value,
                  },
                }}
                data={chartData}
              />
            </ChartGroup>
          </Chart>
        </Link>
      </div>
    </ComponentReady>
  );
};

export default StorageIOPSTotalThresholdChart;
