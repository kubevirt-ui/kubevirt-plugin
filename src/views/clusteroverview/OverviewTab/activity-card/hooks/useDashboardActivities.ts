import * as React from 'react';

import {
  DashboardsOverviewPrometheusActivity,
  DashboardsOverviewResourceActivity,
  DashboardsOverviewResourceActivity as DynamicDashboardsOverviewResourceActivity,
  isDashboardsOverviewPrometheusActivity as isDynamicDashboardsOverviewPrometheusActivity,
  isDashboardsOverviewResourceActivity as isDynamicDashboardsOverviewResourceActivity,
  useK8sModels,
  useResolvedExtensions,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  LoadedExtension,
  ResolvedExtension,
} from '@openshift-console/dynamic-plugin-sdk/lib/types';

const useDashboardActivities = () => {
  const [models] = useK8sModels();

  const [dynamicResourceActivityExtensions] =
    useResolvedExtensions<DynamicDashboardsOverviewResourceActivity>(
      isDynamicDashboardsOverviewResourceActivity,
    );

  const resourceActivities: (
    | LoadedExtension<DashboardsOverviewResourceActivity>
    | ResolvedExtension<DynamicDashboardsOverviewResourceActivity>
  )[] = React.useMemo(
    () =>
      dynamicResourceActivityExtensions?.filter((e) => !!models?.[e.properties.k8sResource.kind]),
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
