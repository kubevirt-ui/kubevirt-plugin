import React from 'react';
import { Link } from 'react-router-dom-v5-compat';
import xbytes from 'xbytes';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { tickLabels } from '@kubevirt-utils/components/Charts/ChartLabels/styleOverrides';
import useVMQuery from '@kubevirt-utils/hooks/useVMQuery';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { PrometheusEndpoint } from '@openshift-console/dynamic-plugin-sdk';
import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartGroup,
  ChartThreshold,
  ChartVoronoiContainer,
} from '@patternfly/react-charts/victory';
import chart_color_black_200 from '@patternfly/react-tokens/dist/esm/chart_color_black_200';
import chart_color_blue_300 from '@patternfly/react-tokens/dist/esm/chart_color_blue_300';
import chart_color_orange_300 from '@patternfly/react-tokens/dist/esm/chart_color_orange_300';
import { useFleetPrometheusPoll } from '@stolostron/multicluster-sdk';
import useDuration from '@virtualmachines/details/tabs/metrics/hooks/useDuration';

import ComponentReady from '../ComponentReady/ComponentReady';
import useResponsiveCharts from '../hooks/useResponsiveCharts';
import { VMQueries } from '../utils/queries';
import {
  addTimestampToTooltip,
  findMaxYValue,
  formatStorageTotalReadWriteThresholdTooltipData,
  getNumberOfDigitsAfterDecimalPoint,
  MILLISECONDS_MULTIPLIER,
  tickFormat,
  TICKS_COUNT,
} from '../utils/utils';

type StorageTotalReadWriteThresholdChartProps = {
  vmi: V1VirtualMachineInstance;
};

const StorageTotalReadWriteThresholdChart: React.FC<StorageTotalReadWriteThresholdChartProps> = ({
  vmi,
}) => {
  const { currentTime, duration, timespan } = useDuration();
  const { query, queryLink } = useVMQuery(vmi, VMQueries.FILESYSTEM_USAGE_TOTAL);

  const { height, ref, width } = useResponsiveCharts();

  const [data] = useFleetPrometheusPoll({
    cluster: getCluster(vmi),
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    endTime: currentTime,
    namespace: getNamespace(vmi),
    query,
    timespan,
  });

  const storageWriteData = data?.data?.result?.[0]?.values;

  const chartData = storageWriteData?.map(([x, y]) => {
    return { x: new Date(x * MILLISECONDS_MULTIPLIER), y: Number(y) };
  });
  const yMax = findMaxYValue(chartData);

  const thresholdData = storageWriteData?.map(([x]) => {
    return { x: new Date(x * MILLISECONDS_MULTIPLIER), y: yMax };
  });
  return (
    <ComponentReady isReady={!isEmpty(chartData)} linkToMetrics={queryLink}>
      <div className="util-threshold-chart" ref={ref}>
        <Link to={queryLink}>
          <Chart
            containerComponent={
              <ChartVoronoiContainer
                constrainToVisibleArea
                labels={addTimestampToTooltip(formatStorageTotalReadWriteThresholdTooltipData)}
              />
            }
            domain={{
              x: [currentTime - timespan, currentTime],
              y: [0, yMax],
            }}
            height={height}
            padding={{ bottom: 35, left: 70, right: 35, top: 35 }}
            scale={{ x: 'time', y: 'linear' }}
            width={width}
          >
            <ChartAxis
              style={{
                grid: {
                  stroke: chart_color_black_200.value,
                },
                tickLabels,
              }}
              tickFormat={(tick: number) =>
                xbytes(tick, { fixed: getNumberOfDigitsAfterDecimalPoint(yMax), iec: true })
              }
              dependentAxis
              tickValues={[0, yMax]}
            />
            <ChartAxis
              style={{
                tickLabels: { padding: 2, ...tickLabels },
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
            <ChartThreshold
              style={{
                data: {
                  stroke: chart_color_orange_300.value,
                  strokeDasharray: 10,
                },
              }}
              data={thresholdData}
            />
          </Chart>
        </Link>
      </div>
    </ComponentReady>
  );
};

export default StorageTotalReadWriteThresholdChart;
