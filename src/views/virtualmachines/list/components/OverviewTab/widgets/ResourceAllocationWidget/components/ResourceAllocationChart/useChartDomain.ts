import { useMemo } from 'react';

import { type ChartDomain } from '@overview/OverviewTab/metric-charts-card/utils/hooks/types';
import { type MetricChartData } from '@overview/OverviewTab/metric-charts-card/utils/hooks/useMetricChartData';
import t_chart_theme_colorscales_gray_colorscale_100 from '@patternfly/react-tokens/dist/esm/t_chart_theme_colorscales_gray_colorscale_100';
import t_chart_theme_colorscales_orange_colorscale_400 from '@patternfly/react-tokens/dist/esm/t_chart_theme_colorscales_orange_colorscale_400';

import { CHART_DAYS_WINDOW } from '../../utils/constants';

type ChartLinePoint = {
  _color: string;
  _dashed: boolean;
  x: Date;
  y: number;
};

type UseChartDomainParams = {
  effectiveData: MetricChartData;
  isMultiCluster: boolean;
  quotaValue?: number;
  requestedValue?: number;
};

type UseChartDomainResult = {
  effectiveDataForTicks: MetricChartData;
  effectiveDomain: ChartDomain;
  hasQuotaLines: boolean;
  quotaLineData: ChartLinePoint[] | null;
  requestedLineData: ChartLinePoint[] | null;
  xAxisTicks: Date[];
};

const useChartDomain = ({
  effectiveData,
  isMultiCluster,
  quotaValue,
  requestedValue,
}: UseChartDomainParams): UseChartDomainResult => {
  const effectiveDataForTicks = useMemo(
    () => ({
      ...effectiveData,
      largestValue: Math.max(effectiveData.largestValue, quotaValue ?? 0, requestedValue ?? 0),
    }),
    [effectiveData, quotaValue, requestedValue],
  );

  const xAxisTicks = useMemo(() => {
    const today = new Date();
    return Array.from({ length: CHART_DAYS_WINDOW }, (_unused, idx) => {
      const day = new Date(today);
      day.setDate(day.getDate() - (CHART_DAYS_WINDOW - 1 - idx));
      day.setHours(12, 0, 0, 0);
      return day;
    });
  }, []);

  const effectiveDomain: ChartDomain = useMemo(
    () => ({
      x: [xAxisTicks[0], xAxisTicks[xAxisTicks.length - 1]],
      y: [
        effectiveData.domain?.y?.[0] ?? 0,
        Math.max(effectiveData.domain?.y?.[1] ?? 0, quotaValue ?? 0, requestedValue ?? 0),
      ],
    }),
    [effectiveData.domain, xAxisTicks, quotaValue, requestedValue],
  );

  const hasQuotaLines = !isMultiCluster && (quotaValue != null || requestedValue != null);

  const flatLineXValues = useMemo(
    () =>
      effectiveData.chartData?.length
        ? effectiveData.chartData.map((point) => point.x)
        : xAxisTicks,
    [effectiveData.chartData, xAxisTicks],
  );

  const quotaLineData = useMemo(
    () =>
      quotaValue != null && effectiveDomain.x[0]
        ? flatLineXValues.map((xVal) => ({
            _color: t_chart_theme_colorscales_gray_colorscale_100.value,
            _dashed: true,
            x: xVal,
            y: quotaValue,
          }))
        : null,
    [quotaValue, flatLineXValues, effectiveDomain.x],
  );

  const requestedLineData = useMemo(
    () =>
      requestedValue != null && effectiveDomain.x[0]
        ? flatLineXValues.map((xVal) => ({
            _color: t_chart_theme_colorscales_orange_colorscale_400.value,
            _dashed: true,
            x: xVal,
            y: requestedValue,
          }))
        : null,
    [requestedValue, flatLineXValues, effectiveDomain.x],
  );

  return {
    effectiveDataForTicks,
    effectiveDomain,
    hasQuotaLines,
    quotaLineData,
    requestedLineData,
    xAxisTicks,
  };
};

export default useChartDomain;
