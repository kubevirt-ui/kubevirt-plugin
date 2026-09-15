import React, { type FC } from 'react';
import { Link } from 'react-router';
import xbytes from 'xbytes';

import { type V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
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
import useStableYMax from '../hooks/useStableYMax';
import { VMQueries } from '../utils/queries';
import {
  addTimestampToTooltip,
  findMaxYValue,
  formatStorageTotalReadWriteThresholdTooltipData,
  getChartYRange,
  getNumberOfDigitsAfterDecimalPoint,
  MILLISECONDS_MULTIPLIER,
  tickFormat,
  TICKS_COUNT,
} from '../utils/utils';

type StorageTotalReadWriteThresholdChartProps = {
  vmi?: V1VirtualMachineInstance;
};

const StorageTotalReadWriteThresholdChart: FC<StorageTotalReadWriteThresholdChartProps> = ({
  vmi,
}) => {
  const { currentTime, duration, timespan } = useDuration();
  const { query, queryLink } = useVMQuery(vmi, VMQueries.FILESYSTEM_USAGE_TOTAL);

  const { height, ref, width } = useResponsiveCharts();

  const [data, loaded, error] = useFleetPrometheusPoll({
    cluster: getCluster(vmi),
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    endTime: currentTime,
    namespace: getNamespace(vmi),
    query,
    timespan,
  });

  const isLoading = !vmi || !loaded;
  const storageWriteData = data?.data?.result?.[0]?.values;

  const chartData = storageWriteData?.map(([timestamp, value]) => {
    return { x: new Date(timestamp * MILLISECONDS_MULTIPLIER), y: Number(value) };
  });
  const yMax = useStableYMax(findMaxYValue(chartData), `${vmi?.metadata?.uid}_${duration}`);
  const yRange = getChartYRange(yMax);

  const thresholdData =
    yMax != null
      ? storageWriteData?.map(([timestamp]) => ({
          x: new Date(timestamp * MILLISECONDS_MULTIPLIER),
          y: yMax,
        }))
      : undefined;
  return (
    <ComponentReady
      error={error}
      isLoading={isLoading}
      isReady={!isEmpty(chartData)}
      linkToMetrics={queryLink}
    >
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
              ...(yRange && { y: yRange }),
            }}
            height={height}
            padding={{ bottom: 35, left: 70, right: 35, top: 35 }}
            scale={{ x: 'time', y: 'linear' }}
            width={width}
          >
            <ChartAxis
              dependentAxis
              style={{
                grid: {
                  stroke: chart_color_black_200.value,
                },
                tickLabels,
              }}
              tickFormat={(tick: number) =>
                xbytes(tick, { fixed: getNumberOfDigitsAfterDecimalPoint(yMax ?? 0), iec: true })
              }
              {...(yRange && { tickValues: yRange })}
            />
            <ChartAxis
              axisComponent={<></>}
              style={{
                tickLabels: { padding: 2, ...tickLabels },
                ticks: { stroke: 'transparent' },
              }}
              tickCount={TICKS_COUNT}
              tickFormat={tickFormat(duration, currentTime)}
            />
            <ChartGroup>
              <ChartArea
                data={chartData}
                style={{
                  data: {
                    stroke: chart_color_blue_300.value,
                  },
                }}
              />
            </ChartGroup>
            {thresholdData && (
              <ChartThreshold
                data={thresholdData}
                style={{
                  data: {
                    stroke: chart_color_orange_300.value,
                    strokeDasharray: 10,
                  },
                }}
              />
            )}
          </Chart>
        </Link>
      </div>
    </ComponentReady>
  );
};

export default StorageTotalReadWriteThresholdChart;
