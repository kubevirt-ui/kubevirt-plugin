import React from 'react';

import ErrorAlert from '@kubevirt-utils/components/ErrorAlert/ErrorAlert';
import LoadingEmptyState from '@kubevirt-utils/components/LoadingEmptyState/LoadingEmptyState';
import MutedTextSpan from '@kubevirt-utils/components/MutedTextSpan/MutedTextSpan';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Bullseye, Card, CardBody, Grid, GridItem } from '@patternfly/react-core';

import useMetricChartData from '../utils/hooks/useMetricChartData';
import { ChartCardProps } from '../utils/types';
import { getCurrentValue } from '../utils/utils';

import MetricChart from './MetricChart';

import './ChartCard.scss';

const ChartCard: React.FC<ChartCardProps> = ({ metric }) => {
  const { t } = useKubevirtTranslation();
  const metricChartData = useMetricChartData(metric);
  const { chartData, error, isReady, loaded, numberOfTicks, unit } = metricChartData;

  if (error || !loaded) {
    return (
      <Card className="metric-chart-card">
        <CardBody>{error ? <ErrorAlert error={error} /> : <LoadingEmptyState />}</CardBody>
      </Card>
    );
  }

  const currentValue = getCurrentValue(chartData);
  const chartLabel = t("Last {{numOfDays}} days' trend", { numOfDays: numberOfTicks });
  const metricLabel = unit && isReady ? `${metric} (${unit})` : metric;
  const metricValue = currentValue && !isNaN(currentValue) ? currentValue?.toLocaleString() : 0;

  return (
    <Card className="metric-chart-card">
      <Grid className="metric-chart-card__content">
        <GridItem className="metric-chart-card__header">
          <div className="metric-chart-card__header--current-value">
            <span className="metric-chart-card__header--value">{metricValue}</span>
          </div>
          <div className="metric-chart-card__header--metric">{metricLabel}</div>
        </GridItem>
        <GridItem className="metric-chart-card__chart">
          {isReady ? (
            <>
              <div className="metric-chart-card__chart--label">{chartLabel}</div>
              <div className="metric-chart-card__chart--chart">
                <MetricChart metric={metric} metricChartData={metricChartData} />
              </div>
            </>
          ) : (
            <Bullseye>
              <MutedTextSpan
                text={
                  isEmpty(chartData)
                    ? t('No data available')
                    : t(
                        'VMs in this namespace are new, therefore not enough data is collected to display a graph.',
                      )
                }
              />
            </Bullseye>
          )}
        </GridItem>
      </Grid>
    </Card>
  );
};

export default ChartCard;
