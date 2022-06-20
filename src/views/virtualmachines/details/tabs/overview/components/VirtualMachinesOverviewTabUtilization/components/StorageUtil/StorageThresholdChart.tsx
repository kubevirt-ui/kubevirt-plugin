import React from 'react';
import xbytes from 'xbytes';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { PrometheusEndpoint, usePrometheusPoll } from '@openshift-console/dynamic-plugin-sdk';
import {
  Chart,
  ChartArea,
  ChartGroup,
  ChartTooltip,
  ChartVoronoiContainer,
} from '@patternfly/react-charts';
import chart_color_blue_300 from '@patternfly/react-tokens/dist/esm/chart_color_blue_300';
import chart_global_FontSize_2xl from '@patternfly/react-tokens/dist/esm/chart_global_FontSize_2xl';

import { getMultilineUtilizationQueries } from '../../utils/queries';
import ComponentReady from '../ComponentReady/ComponentReady';
// import chart_color_orange_300 from '@patternfly/react-tokens/dist/esm/chart_color_orange_300';

type StorageThresholdChartProps = {
  timespan: number;
  vmi: V1VirtualMachineInstance;
};

const GIB_IN_BYTES = 1024;

const StorageThresholdChart: React.FC<StorageThresholdChartProps> = ({ timespan, vmi }) => {
  const queries = React.useMemo(
    () => getMultilineUtilizationQueries({ vmName: vmi?.metadata?.name }),
    [vmi],
  );

  const [data] = usePrometheusPoll({
    query: queries?.FILESYSTEM_USAGE?.[1]?.query,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    namespace: vmi?.metadata?.namespace,
    timespan,
  });

  const storageWriteData = data?.data?.result?.[0]?.values;

  const chartData = storageWriteData?.map(([, item], index) => {
    return { x: index, y: Number(+item / GIB_IN_BYTES) };
  });

  //! should be fixed once promethesus request adjust
  // const thresholdLine = new Array(chartData?.length || 0)
  //   .fill(0)
  //   .map((_, index) => ({ x: index, y: threshold / GIB_IN_BYTES }));

  return (
    <ComponentReady isReady={!isEmpty(chartData)}>
      <Chart
        height={200}
        showAxis={false}
        containerComponent={
          <ChartVoronoiContainer
            labels={({ datum }) => {
              return `Data written: ${xbytes(datum?.y, { iec: true, fixed: 2 })}`;
            }}
            labelComponent={<ChartTooltip style={{ fontSize: chart_global_FontSize_2xl.value }} />}
            constrainToVisibleArea
          />
        }
      >
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
        {/* ! should be fixed once promethesus request adjust */}
        {/* <ChartThreshold
          data={thresholdLine}
          style={{
            data: {
              stroke: chart_color_orange_300.value,
              strokeDasharray: 10,
              strokeWidth: 3,
            },
          }}
        /> */}
      </Chart>
    </ComponentReady>
  );
};

export default StorageThresholdChart;
