import { useMemo } from 'react';

import {
  type DashboardsOverviewPrometheusActivity,
  type DashboardsOverviewResourceActivity,
  type DashboardsOverviewResourceActivity as DynamicDashboardsOverviewResourceActivity,
  isDashboardsOverviewPrometheusActivity as isDynamicDashboardsOverviewPrometheusActivity,
  isDashboardsOverviewResourceActivity as isDynamicDashboardsOverviewResourceActivity,
  useK8sModels,
  useResolvedExtensions,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  type LoadedExtension,
  type ResolvedExtension,
} from '@openshift-console/dynamic-plugin-sdk/lib/types';

type UseDashboardActivitiesReturn = {
  prometheusActivities: ResolvedExtension<DashboardsOverviewPrometheusActivity>[];
  resourceActivities: (
    | LoadedExtension<DashboardsOverviewResourceActivity>
    | ResolvedExtension<DynamicDashboardsOverviewResourceActivity>
  )[];
};

const useDashboardActivities = (): UseDashboardActivitiesReturn => {
  const [models] = useK8sModels();

  const [dynamicResourceActivityExtensions] =
    useResolvedExtensions<DynamicDashboardsOverviewResourceActivity>(
      isDynamicDashboardsOverviewResourceActivity,
    );

  const resourceActivities: (
    | LoadedExtension<DashboardsOverviewResourceActivity>
    | ResolvedExtension<DynamicDashboardsOverviewResourceActivity>
  )[] = useMemo(
    () =>
      dynamicResourceActivityExtensions?.filter((e) => {
        const modelKey = e.properties.k8sResource.groupVersionKind?.kind;
        return !!modelKey && !!models?.[modelKey];
      }),
    [dynamicResourceActivityExtensions, models],
  );

  const [dynamicPrometheusActivities] = useResolvedExtensions<DashboardsOverviewPrometheusActivity>(
    isDynamicDashboardsOverviewPrometheusActivity,
  );

  return {
    prometheusActivities: dynamicPrometheusActivities,
    resourceActivities,
  };
};

export default useDashboardActivities;
