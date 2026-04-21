import React, { FC, useMemo } from 'react';

import LoadingEmptyState from '@kubevirt-utils/components/LoadingEmptyState/LoadingEmptyState';
import { ALL_CLUSTERS_KEY } from '@kubevirt-utils/hooks/constants';
import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import useCurrentTime from '@kubevirt-utils/hooks/useCurrentTime';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { TopConsumersData } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/types';
import useActiveClusterParam from '@multicluster/hooks/useActiveClusterParam';
import { PrometheusEndpoint } from '@openshift-console/dynamic-plugin-sdk';
import { CardBody } from '@patternfly/react-core';
import { useFleetPrometheusPoll, useHubClusterName } from '@stolostron/multicluster-sdk';

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
  localStorageData: TopConsumersData;
  metric: TopConsumerMetric;
  scope: TopConsumerScope;
};

export const TopConsumersChartList: FC<TopConsumersChartListProps> = ({
  localStorageData,
  metric,
  scope,
}) => {
  const { t } = useKubevirtTranslation();
  const activeNamespace = useActiveNamespace();
  const cluster = useActiveClusterParam();
  const [hubClusterName] = useHubClusterName();
  const duration = useMemo(
    () => localStorageData?.[TOP_CONSUMERS_DURATION_KEY],
    [localStorageData],
  );
  const numItemsLabel = useMemo(
    () => localStorageData?.[TOP_CONSUMERS_NUM_ITEMS_KEY],
    [localStorageData],
  );
  const numItemsToShow = useMemo(
    () => (numItemsLabel === SHOW_TOP_5_ITEMS ? 5 : 10),
    [numItemsLabel],
  );

  const currentTime = useCurrentTime();

  const [query, loaded] = useFleetPrometheusPoll({
    endpoint: PrometheusEndpoint.QUERY,
    endTime: currentTime,
    query: getTopConsumerQuery(
      metric?.getValue(),
      scope?.getValue(),
      numItemsToShow,
      duration,
      activeNamespace,
      cluster === ALL_CLUSTERS_KEY ? undefined : cluster,
      hubClusterName,
    ),
    ...(cluster === ALL_CLUSTERS_KEY ? { allClusters: true } : { cluster }),
  });
  const numQueryResults = query?.data?.result?.length;
  const isLoading = !loaded;

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
          key={`chart-${metric?.getValue()}-${scope?.getValue()}-${i}`}
          labelUnit={humanizedValue.unit}
          labelValue={humanizedValue.value}
          maxValue={max}
          title={title}
          value={rawValue}
        />,
      );
    }
    return charts;
  }, [query, metric, scope, numItemsToShow, numQueryResults]);

  const showNoDataMessage = loaded && numQueryResults === 0;

  const renderTopConsumersContent = () => {
    if (isLoading) {
      return <LoadingEmptyState />;
    }
    if (showNoDataMessage) {
      return <NoDataAvailableMessage isVCPU={metric === TopConsumerMetric.VCPU_WAIT} />;
    }
    return ChartList;
  };

  return (
    <CardBody className="kv-top-consumers-card__chart-list-container">
      <div className="kv-top-consumers-card__metric-title">{t(metric?.getChartLabel())}</div>
      <div className="kv-top-consumers-card__chart-list-body">{renderTopConsumersContent()}</div>
    </CardBody>
  );
};
