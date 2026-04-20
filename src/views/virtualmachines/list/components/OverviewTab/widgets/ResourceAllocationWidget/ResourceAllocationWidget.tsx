import React, { FCC, ReactNode, useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { convertBinaryUnit } from '@kubevirt-utils/utils/units';
import { MetricChartData } from '@overview/OverviewTab/metric-charts-card/utils/hooks/useMetricChartData';
import { getCurrentValue } from '@overview/OverviewTab/metric-charts-card/utils/utils';
import { Card, CardBody, CardHeader, CardTitle, Content, Skeleton } from '@patternfly/react-core';

import QuotaFooter from './components/QuotaFooter';
import ResourceAllocationChart from './components/ResourceAllocationChart/ResourceAllocationChart';
import {
  getUnitLabel,
  MetricQuotaData,
  UNIT_GIB,
  UNIT_VCPU,
} from './hooks/useProjectResourceQuota';
import { TopClustersMetricData } from './hooks/useTopClustersChartData';
import { EMPTY_METRIC_DATA, formatBinaryValue, toMetricChartData } from './utils/utils';

import './ResourceAllocationWidget.scss';

type ResourceAllocationWidgetProps = {
  /** Multi-cluster series data (used when in all-clusters mode). */
  clusterData?: TopClustersMetricData;
  graphTitle: string;
  metric: string;
  /** Single aggregated metric data (used when NOT in all-clusters mode). */
  metricChartData?: MetricChartData;
  /** Quota data for the project-level footer and chart lines. */
  quotaData?: MetricQuotaData;
  subtitle: ReactNode;
  title: string;
};

const ResourceAllocationWidget: FCC<ResourceAllocationWidgetProps> = ({
  clusterData,
  graphTitle,
  metric,
  metricChartData,
  quotaData,
  subtitle,
  title,
}) => {
  const { t } = useKubevirtTranslation();
  const isMultiCluster = Boolean(clusterData);

  const rawData: MetricChartData = isMultiCluster
    ? toMetricChartData(clusterData)
    : metricChartData ?? EMPTY_METRIC_DATA;

  const targetUnit = quotaData?.label;

  const effectiveData: MetricChartData = useMemo(() => {
    const factor = convertBinaryUnit(1, rawData.unit, targetUnit);
    if (factor === 1) return rawData;

    return {
      ...rawData,
      chartData: rawData.chartData?.map((p) => ({
        ...p,
        y: Math.round(p.y * factor * 100) / 100,
      })),
      domain: {
        ...rawData.domain,
        y: rawData.domain?.y
          ? [
              rawData.domain.y[0] != null ? rawData.domain.y[0] * factor : rawData.domain.y[0],
              rawData.domain.y[1] != null ? rawData.domain.y[1] * factor : rawData.domain.y[1],
            ]
          : rawData.domain?.y,
      },
      largestValue: rawData.largestValue * factor,
      unit: targetUnit,
    };
  }, [rawData, targetUnit]);

  const { loaded } = effectiveData;

  const currentValue = getCurrentValue(effectiveData.chartData);

  const footerDisplay = useMemo(() => {
    if (!quotaData) return '';
    const usedVal = currentValue ?? 0;
    const { label, quotaValue } = quotaData;

    if (label === UNIT_GIB) {
      const usedStr = formatBinaryValue(usedVal, label, t);
      const totalStr = formatBinaryValue(quotaValue, label, t);
      return t('{{used}} / {{total}} used', { total: totalStr, used: usedStr });
    }

    const formatValue = (value: number): number | string =>
      label === UNIT_VCPU ? parseFloat(value.toFixed(2)) : Math.round(value);
    const unitLabel = getUnitLabel(label, t);
    return t('{{used}}/{{total}} {{unit}} used', {
      total: formatValue(quotaValue),
      unit: unitLabel,
      used: formatValue(usedVal),
    });
  }, [currentValue, quotaData, t]);

  return (
    <Card className="resource-allocation-widget" data-test="resource-allocation-widget" isCompact>
      <CardHeader>
        <CardTitle className="resource-allocation-widget__header">
          {title}{' '}
          <Content className="resource-allocation-widget__subtitle" component="p">
            {!loaded ? <Skeleton width="60px" /> : subtitle}
          </Content>
        </CardTitle>
      </CardHeader>
      <CardBody>
        <div className="resource-allocation-widget__graph">
          <div className="resource-allocation-widget__graph-title">{graphTitle}</div>
          <ResourceAllocationChart
            requestedValue={
              !isMultiCluster && quotaData?.requestedValue != null
                ? quotaData.requestedValue
                : undefined
            }
            chartSeries={clusterData?.chartSeries}
            effectiveData={effectiveData}
            isMultiCluster={isMultiCluster}
            metric={metric}
            quotaValue={!isMultiCluster ? quotaData?.quotaValue : undefined}
          />
        </div>
        {quotaData && <QuotaFooter display={footerDisplay} icon={quotaData.icon} />}
      </CardBody>
    </Card>
  );
};

export default ResourceAllocationWidget;
