import React, { type FC } from 'react';

import useResponsiveCharts from '@kubevirt-utils/components/Charts/hooks/useResponsiveCharts';
import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getNoDataAvailableMessage } from '@kubevirt-utils/utils/utils';
import getYAxisTicks from '@overview/OverviewTab/metric-charts-card/utils/hooks/getYAxisTicks';
import { type MetricChartData } from '@overview/OverviewTab/metric-charts-card/utils/hooks/useMetricChartData';
import { getLabelUnit } from '@overview/OverviewTab/metric-charts-card/utils/utils';
import { Bullseye, Skeleton } from '@patternfly/react-core';

import { type ClusterChartSeries } from '../../hooks/useTopClustersChartData';
import ResourceAllocationChartContent from './ResourceAllocationChartContent';
import useChartDomain from './useChartDomain';
import { useChartTooltips } from './useChartTooltips';

type ResourceAllocationChartProps = {
  chartSeries?: ClusterChartSeries[];
  effectiveData: MetricChartData;
  isMultiCluster: boolean;
  metric: string;
  /** Flat horizontal quota limit line (gray dashed). Only rendered in single-cluster mode. */
  quotaValue?: number;
  /** Flat horizontal requested line (orange dashed). Only rendered in single-cluster mode. */
  requestedValue?: number;
};

const ResourceAllocationChart: FC<ResourceAllocationChartProps> = ({
  chartSeries,
  effectiveData,
  isMultiCluster,
  metric,
  quotaValue,
  requestedValue,
}) => {
  const { t } = useKubevirtTranslation();
  const { error, isReady, loaded, unit } = effectiveData;
  const { height, ref, width } = useResponsiveCharts();
  const displayUnit = getLabelUnit(metric, unit) as string;

  const {
    effectiveDataForTicks,
    effectiveDomain,
    hasQuotaLines,
    quotaLineData,
    requestedLineData,
    xAxisTicks,
  } = useChartDomain({ effectiveData, isMultiCluster, quotaValue, requestedValue });

  const [yAxisTickValues] = getYAxisTicks(effectiveDataForTicks);

  const { baseTooltipLabel, quotaTooltipLabel } = useChartTooltips({
    displayUnit,
    isMultiCluster,
    t,
  });

  if (loaded && error) {
    return (
      <div
        className="resource-allocation-widget__chart"
        data-test={`resource-allocation-chart-${metric}`}
        ref={ref}
      >
        <ErrorAlert error={error} />
      </div>
    );
  }

  if (!loaded || width === 0) {
    return (
      <div
        className="resource-allocation-widget__chart"
        data-test={`resource-allocation-chart-${metric}`}
        ref={ref}
      >
        <Skeleton height="100%" width="100%" />
      </div>
    );
  }

  if (!isReady && !hasQuotaLines) {
    return (
      <div
        className="resource-allocation-widget__chart"
        data-test={`resource-allocation-chart-${metric}`}
        ref={ref}
      >
        <Bullseye>
          <MutedTextSpan text={getNoDataAvailableMessage(t)} />
        </Bullseye>
      </div>
    );
  }

  return (
    <div
      className="resource-allocation-widget__chart"
      data-test={`resource-allocation-chart-${metric}`}
      ref={ref}
    >
      <ResourceAllocationChartContent
        baseTooltipLabel={baseTooltipLabel}
        chartSeries={chartSeries}
        effectiveData={effectiveData}
        effectiveDomain={effectiveDomain}
        hasQuotaLines={hasQuotaLines}
        height={height}
        isMultiCluster={isMultiCluster}
        quotaLineData={quotaLineData}
        quotaTooltipLabel={quotaTooltipLabel}
        requestedLineData={requestedLineData}
        width={width}
        xAxisTicks={xAxisTicks}
        yAxisTickValues={yAxisTickValues}
      />
    </div>
  );
};

export default ResourceAllocationChart;
