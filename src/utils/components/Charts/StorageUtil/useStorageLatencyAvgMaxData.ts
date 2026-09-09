import { type V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type ChartPoint } from '@kubevirt-utils/components/Charts/MetricChartUtils/hooks/types';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { PrometheusEndpoint, type PrometheusValue } from '@openshift-console/dynamic-plugin-sdk';
import { chart_color_orange_300 } from '@patternfly/react-tokens';
import chart_color_blue_300 from '@patternfly/react-tokens/dist/esm/chart_color_blue_300';
import { useFleetPrometheusPoll } from '@stolostron/multicluster-sdk';

import useStableYMax from '../hooks/useStableYMax';
import {
  AVG_LABEL,
  findMaxYValue,
  getChartYRange,
  MAX_LABEL,
  MILLISECONDS_MULTIPLIER,
} from '../utils/utils';

export type StorageLatencyLegendDatum = {
  name: string;
  symbol: { fill: string; type: string };
};

export type StorageLatencyAvgMaxData = {
  avgChartData: ChartPoint[] | undefined;
  error: unknown;
  isLoading: boolean;
  legendData: StorageLatencyLegendDatum[];
  maxChartData: ChartPoint[] | undefined;
  yMax: null | number;
  yRange: [number, number] | undefined;
};

export type UseStorageLatencyAvgMaxDataArgs = {
  currentTime: number;
  duration: string;
  queryAvg: string;
  queryMax: string;
  timespan: number;
  vmi: V1VirtualMachineInstance;
};

const toChartPoints = (values: PrometheusValue[] | undefined): ChartPoint[] | undefined =>
  values?.map(
    (point): ChartPoint => ({
      x: new Date(point[0] * MILLISECONDS_MULTIPLIER),
      y: Number(point[1]),
    }),
  );

const useStorageLatencyAvgMaxData = ({
  currentTime,
  duration,
  queryAvg,
  queryMax,
  timespan,
  vmi,
}: UseStorageLatencyAvgMaxDataArgs): StorageLatencyAvgMaxData => {
  const [avgData, avgLoaded, avgError] = useFleetPrometheusPoll({
    cluster: getCluster(vmi),
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    endTime: currentTime,
    namespace: getNamespace(vmi),
    query: queryAvg,
    timespan,
  });

  const [maxData, maxLoaded, maxError] = useFleetPrometheusPoll({
    cluster: getCluster(vmi),
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    endTime: currentTime,
    namespace: getNamespace(vmi),
    query: queryMax,
    timespan,
  });

  const avgChartData = toChartPoints(avgData?.data?.result?.[0]?.values);
  const maxChartData = toChartPoints(maxData?.data?.result?.[0]?.values);
  const yMax = useStableYMax(
    findMaxYValue([...(avgChartData ?? []), ...(maxChartData ?? [])]),
    `${vmi?.metadata?.uid}_${duration}`,
  );

  return {
    avgChartData,
    error: avgError ?? maxError,
    isLoading: !avgLoaded || !maxLoaded,
    legendData: [
      {
        name: AVG_LABEL,
        symbol: { fill: chart_color_blue_300.value, type: 'square' },
      },
      {
        name: MAX_LABEL,
        symbol: { fill: chart_color_orange_300.value, type: 'square' },
      },
    ],
    maxChartData,
    yMax,
    yRange: getChartYRange(yMax),
  };
};

export default useStorageLatencyAvgMaxData;
