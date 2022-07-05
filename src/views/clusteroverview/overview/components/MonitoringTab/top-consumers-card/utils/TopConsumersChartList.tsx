import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PrometheusEndpoint, usePrometheusPoll } from '@openshift-console/dynamic-plugin-sdk';
import { CardBody } from '@patternfly/react-core';

import NoDataAvailableMessage from './NoDataAvailableMessage';
import { getTopConsumerQuery } from './queries';
import { TopConsumerMetric } from './topConsumerMetric';
import { TopConsumerScope } from './topConsumerScope';
import TopConsumersProgressChart from './TopConsumersProgressChart';
import { getHumanizedValue, getValue } from './utils';

import './TopConsumersChartList.scss';

const getChartTitle = (scope, queryData) => {
  let title = '';
  const metricData = queryData?.metric;
  switch (scope) {
    case TopConsumerScope.NODE:
      title = metricData?.node;
      break;
    case TopConsumerScope.PROJECT:
      title = metricData?.namespace;
      break;
    case TopConsumerScope.VM:
    default:
      title =
        metricData?.name || metricData?.label_vm_kubevirt_io_name || `VMI (${metricData.pod})`;
      break;
  }

  return title;
};

type TopConsumersChartListProps = {
  numItems: number;
  metric: TopConsumerMetric;
  scope: TopConsumerScope;
};

export const TopConsumersChartList: React.FC<TopConsumersChartListProps> = ({
  numItems,
  metric,
  scope,
}) => {
  const { t } = useKubevirtTranslation();
  const [query] = usePrometheusPoll({
    endpoint: PrometheusEndpoint.QUERY,
    query: getTopConsumerQuery(metric.getValue(), scope.getValue(), numItems),
    endTime: Date.now(),
  });
  const numQueryResults = query?.data?.result?.length;

  const ChartList = React.useMemo(() => {
    const numLinesToShow = numQueryResults >= numItems ? numItems : numQueryResults;
    const max = getValue(query?.data?.result[0]?.value?.[1]);
    const charts = [];

    for (let i = 0; i < numLinesToShow; i++) {
      const queryData = query?.data?.result[i];
      const title = getChartTitle(scope, queryData);
      const rawValue = getValue(queryData?.value?.[1]);
      const humanizedValue = getHumanizedValue(rawValue, metric);

      charts.push(
        <TopConsumersProgressChart
          title={title}
          value={rawValue}
          labelValue={humanizedValue.value}
          labelUnit={humanizedValue.unit}
          maxValue={max}
          key={`chart-${metric.getValue()}-${scope.getValue()}-${i}`}
        />,
      );
    }
    return charts;
  }, [query, metric, scope, numItems, numQueryResults]);

  const showNoDataMessage = numQueryResults === 0;

  return (
    <CardBody className="kv-top-consumers-card__chart-list-container">
      <div className="kv-top-consumers-card__metric-title">{t(metric.getChartLabel())}</div>
      <div className="kv-top-consumers-card__chart-list-body">
        {showNoDataMessage ? (
          <NoDataAvailableMessage isVCPU={metric === TopConsumerMetric.VCPU_WAIT} />
        ) : (
          ChartList
        )}
      </div>
    </CardBody>
  );
};
