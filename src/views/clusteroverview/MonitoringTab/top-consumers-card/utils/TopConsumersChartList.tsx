import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useLocalStorage from '@kubevirt-utils/hooks/useLocalStorage';
import { PrometheusEndpoint, usePrometheusPoll } from '@openshift-console/dynamic-plugin-sdk';
import { CardBody } from '@patternfly/react-core';

import {
  SHOW_TOP_5_ITEMS,
  TOP_CONSUMERS_DURATION_KEY,
  TOP_CONSUMERS_NUM_ITEMS_KEY,
} from './constants';
import NoDataAvailableMessage from './NoDataAvailableMessage';
import { getTopConsumerQuery } from './queries';
import { TopConsumerMetric } from './topConsumerMetric';
import { TopConsumerScope } from './topConsumerScope';
import TopConsumersProgressChart from './TopConsumersProgressChart';
import { getChartTitle, getHumanizedValue, getValue } from './utils';

import './TopConsumersChartList.scss';

type TopConsumersChartListProps = {
  metric: TopConsumerMetric;
  scope: TopConsumerScope;
};

export const TopConsumersChartList: React.FC<TopConsumersChartListProps> = ({ metric, scope }) => {
  const { t } = useKubevirtTranslation();
  const [duration] = useLocalStorage(TOP_CONSUMERS_DURATION_KEY);
  const [numItemsLabel] = useLocalStorage(TOP_CONSUMERS_NUM_ITEMS_KEY);
  const numItemsToShow = React.useMemo(
    () => (numItemsLabel === SHOW_TOP_5_ITEMS ? 5 : 10),
    [numItemsLabel],
  );

  const [query] = usePrometheusPoll({
    endpoint: PrometheusEndpoint.QUERY,
    query: getTopConsumerQuery(metric?.getValue(), scope?.getValue(), numItemsToShow, duration),
    endTime: Date.now(),
  });
  const numQueryResults = query?.data?.result?.length;

  const ChartList = React.useMemo(() => {
    const numLinesToShow = numQueryResults >= numItemsToShow ? numItemsToShow : numQueryResults;
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
          key={`chart-${metric?.getValue()}-${scope?.getValue()}-${i}`}
        />,
      );
    }
    return charts;
  }, [query, metric, scope, numItemsToShow, numQueryResults]);

  const showNoDataMessage = numQueryResults === 0;

  return (
    <CardBody className="kv-top-consumers-card__chart-list-container">
      <div className="kv-top-consumers-card__metric-title">{t(metric?.getChartLabel())}</div>
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
