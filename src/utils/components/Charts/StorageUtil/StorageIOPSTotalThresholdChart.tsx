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
import chart_color_blue_300 from '@patternfly/react-tokens/dist/esm/chart_color_blue_300';
import useDuration from '@virtualmachines/details/tabs/metrics/hooks/useDuration';

import ComponentReady from '../ComponentReady/ComponentReady';
import useResponsiveCharts from '../hooks/useResponsiveCharts';
import { getUtilizationQueries } from '../utils/queries';
import { queriesToLink, tickFormat } from '../utils/utils';

type StorageIOPSTotalThresholdChartProps = {
  vmi: V1VirtualMachineInstance;
};

const StorageIOPSTotalThresholdChart: React.FC<StorageIOPSTotalThresholdChartProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  const { currentTime, duration } = useDuration();
  const queries = React.useMemo(
    () => getUtilizationQueries({ obj: vmi, duration }),
    [vmi, duration],
  );
  const { ref, width, height } = useResponsiveCharts();

  const [data] = usePrometheusPoll({
    query: queries?.STORAGE_IOPS_TOTAL,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    namespace: vmi?.metadata?.namespace,
    endTime: currentTime,
  });

  const storageWriteData = data?.data?.result?.[0]?.values;

  const chartData = storageWriteData?.map(([, item], index) => {
    return { x: index, y: +item };
  });

  return (
    <ComponentReady isReady={!isEmpty(chartData)}>
      <div className="util-threshold-chart" ref={ref}>
        <Link to={queriesToLink(queries?.STORAGE_IOPS_TOTAL)}>
          <Chart
            height={height}
            width={width}
            padding={35}
            scale={{ x: 'time', y: 'linear' }}
            containerComponent={
              <ChartVoronoiContainer
                labels={({ datum }) => t('IOPS total: {{input}}', { input: datum?.y?.toFixed(2) })}
                constrainToVisibleArea
              />
            }
          >
            <ChartAxis
              tickFormat={tickFormat(duration, currentTime)}
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

export default StorageIOPSTotalThresholdChart;
