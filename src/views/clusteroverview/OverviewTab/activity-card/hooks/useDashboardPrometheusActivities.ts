import * as React from 'react';

import { PrometheusResponse, ResolvedExtension } from '@openshift-console/dynamic-plugin-sdk';
import { DashboardsOverviewPrometheusActivity as DynamicDashboardsOverviewPrometheusActivity } from '@openshift-console/dynamic-plugin-sdk/lib/extensions/dashboards';
import { useDashboardResources } from '@openshift-console/dynamic-plugin-sdk-internal';

import useDashboardActivities from './useDashboardActivities';

export type WatchPrometheusQueryProps = {
  query: string;
  namespace?: string;
  timespan?: number;
};

const useDashboardPrometheusActivities = () => {
  const { prometheusActivities } = useDashboardActivities();

  const queries: WatchPrometheusQueryProps[] = prometheusActivities?.reduce(
    (acc, activity) => [...acc, { query: activity?.properties?.queries }],
    [],
  );

  const { prometheusResults } = useDashboardResources({
    prometheusQueries: Array.from(queries),
  });

  const allPrometheusActivities = React.useMemo(
    () =>
      prometheusActivities
        ?.filter((a) => {
          const queryResults = a.properties.queries.map(
            (q) => prometheusResults.getIn([q, 'data']) as PrometheusResponse,
          );
          return a.properties.isActivity(queryResults);
        })
        ?.map((a) => {
          const queryResults = a.properties.queries.map(
            (q) => prometheusResults.getIn([q, 'data']) as PrometheusResponse,
          );
          return {
            // TODO Fix typing
            // skipcq: JS-0349
            loader: (a as any)?.properties.loader,
            // loader: (a as DashboardsOverviewPrometheusActivity)?.properties.loader,
            component: (a as ResolvedExtension<DynamicDashboardsOverviewPrometheusActivity>)
              ?.properties.component,
            results: queryResults,
          };
        }),
    [prometheusActivities, prometheusResults],
  );

  const prometheusQueriesLoaded = React.useMemo(
    () =>
      prometheusActivities.every((a) =>
        a.properties.queries.every(
          (q) => prometheusResults.getIn([q, 'data']) || prometheusResults.getIn([q, 'loadError']),
        ),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [prometheusResults],
  );

  return {
    prometheusActivities: allPrometheusActivities,
    prometheusResults,
    prometheusQueriesLoaded,
  };
};

export default useDashboardPrometheusActivities;
