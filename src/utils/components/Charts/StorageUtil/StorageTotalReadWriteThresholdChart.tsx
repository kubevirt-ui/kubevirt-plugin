import React from 'react';
import { Link } from 'react-router-dom';
import xbytes from 'xbytes';

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
  formatMemoryYTick,
  MILLISECONDS_MULTIPLIER,
  queriesToLink,
  tickFormat,
  TICKS_COUNT,
} from '../utils/utils';

type StorageTotalReadWriteThresholdChartProps = {
  vmi: V1VirtualMachineInstance;
};

const StorageTotalReadWriteThresholdChart: React.FC<StorageTotalReadWriteThresholdChartProps> = ({
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const { currentTime, duration, timespan } = useDuration();
  const queries = React.useMemo(
    () => getUtilizationQueries({ obj: vmi, duration }),
    [vmi, duration],
  );

  const { ref, width, height } = useResponsiveCharts();

  const [data] = usePrometheusPoll({
    query: queries?.FILESYSTEM_TOTAL_USAGE,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    namespace: vmi?.metadata?.namespace,
    endTime: currentTime,
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
        <Link to={queriesToLink(queries?.FILESYSTEM_TOTAL_USAGE)}>
          <Chart
            height={height}
            width={width}
            padding={{ top: 35, bottom: 35, left: 80, right: 35 }}
            scale={{ x: 'time', y: 'linear' }}
            domain={{
              x: [currentTime - timespan, currentTime],
              y: [0, yMax],
            }}
            containerComponent={
              <ChartVoronoiContainer
                labels={({ datum }) =>
                  t('Data transfer: {{input}}', {
                    input: xbytes(datum?.y, { iec: true, fixed: 2 }),
                  })
                }
                constrainToVisibleArea
              />
            }
          >
            <ChartAxis
              dependentAxis
              tickValues={[0, yMax]}
              tickFormat={formatMemoryYTick(yMax, 2)}
              style={{
                grid: {
                  stroke: chart_color_black_200.value,
                },
              }}
            />
            <ChartAxis
              tickFormat={tickFormat(duration, currentTime)}
              tickCount={TICKS_COUNT}
              style={{
                ticks: { stroke: 'transparent' },
              }}
              axisComponent={<></>}
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
          </Chart>
        </Link>
      </div>
    </ComponentReady>
  );
};

export default StorageTotalReadWriteThresholdChart;
