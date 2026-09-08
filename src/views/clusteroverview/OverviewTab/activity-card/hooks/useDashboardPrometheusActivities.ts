// @ai-rules:
// 1. [Pattern]: Activities come as resolved extensions — `loader` is accessed via `in` operator since it's not on the resolved type.
// 2. [Gotcha]: prometheusResults is an ImmutableMap; access values with .getIn().
import { type ComponentType, useMemo } from 'react';

import {
  type PrometheusResponse,
  type ResolvedExtension,
} from '@openshift-console/dynamic-plugin-sdk';
import { type DashboardsOverviewPrometheusActivity as DynamicDashboardsOverviewPrometheusActivity } from '@openshift-console/dynamic-plugin-sdk/lib/extensions/dashboards';
import { useDashboardResources } from '@openshift-console/dynamic-plugin-sdk-internal';

import useDashboardActivities from './useDashboardActivities';

export type WatchPrometheusQueryProps = {
  namespace?: string;
  query: string;
  timespan?: number;
};

type PrometheusActivity = {
  component: ComponentType | undefined;
  loader: unknown;
  results: PrometheusResponse[];
};

type UseDashboardPrometheusActivitiesResult = {
  prometheusActivities: PrometheusActivity[] | undefined;
  prometheusQueriesLoaded: boolean;
  prometheusResults: ReturnType<typeof useDashboardResources>['prometheusResults'];
};

const useDashboardPrometheusActivities = (): UseDashboardPrometheusActivitiesResult => {
  const { prometheusActivities } = useDashboardActivities();

  const queries: WatchPrometheusQueryProps[] = prometheusActivities?.reduce(
    (acc, activity) => [...acc, { query: activity?.properties?.queries }],
    [],
  );

  const { prometheusResults } = useDashboardResources({
    prometheusQueries: Array.from(queries),
  });

  const allPrometheusActivities = useMemo(
    () =>
      prometheusActivities
        ?.filter((activity) => {
          const queryResults = activity.properties.queries.map(
            (query) => prometheusResults.getIn([query, 'data']) as PrometheusResponse,
          );
          return activity.properties.isActivity(queryResults);
        })
        ?.map((activity) => {
          const queryResults = activity.properties.queries.map(
            (query) => prometheusResults.getIn([query, 'data']) as PrometheusResponse,
          );
          return {
            component: (activity as ResolvedExtension<DynamicDashboardsOverviewPrometheusActivity>)
              ?.properties.component,
            loader: 'loader' in activity.properties ? activity.properties.loader : undefined,
            results: queryResults,
          };
        }),
    [prometheusActivities, prometheusResults],
  );

  const prometheusQueriesLoaded = useMemo(
    () =>
      prometheusActivities.every((activity) =>
        activity.properties.queries.every(
          (query) =>
            prometheusResults.getIn([query, 'data']) ||
            prometheusResults.getIn([query, 'loadError']),
        ),
      ),
    [prometheusActivities, prometheusResults],
  );

  return {
    prometheusActivities: allPrometheusActivities,
    prometheusQueriesLoaded,
    prometheusResults,
  };
};

export default useDashboardPrometheusActivities;
