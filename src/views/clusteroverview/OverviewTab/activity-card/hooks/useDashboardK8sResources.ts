// @ai-rules:
// 1. [Pattern]: Activities come as a union of LoadedExtension | ResolvedExtension — `loader` is accessed via `in` operator since it's not on the resolved type.
import { type ComponentType, useMemo } from 'react';

import { get } from '@kubevirt-utils/utils/utils';
import {
  type DashboardsOverviewResourceActivity as DynamicDashboardsOverviewResourceActivity,
  type K8sResourceCommon,
  type ResolvedExtension,
  useK8sWatchResources,
  type WatchK8sResource,
  type WatchK8sResourceWithProp,
} from '@openshift-console/dynamic-plugin-sdk';

import { asUniqueResource, asWatchK8sResource } from '../utils/utils';
import useDashboardActivities from './useDashboardActivities';

type K8sResourceActivity = {
  component: ComponentType | undefined;
  loader: unknown;
  resource: K8sResourceCommon;
  timestamp: Date | null;
};

type UseDashboardK8sResourcesResult = {
  k8sResourceActivities: K8sResourceActivity[] | undefined;
  k8sResources: ReturnType<typeof useK8sWatchResources>;
  k8sResourcesLoaded: boolean | undefined;
};

const useDashboardK8sResources = (): UseDashboardK8sResourcesResult => {
  const { resourceActivities } = useDashboardActivities();

  const resourcesMap = resourceActivities?.reduce((acc, activity, idx) => {
    const k8sResource = activity.properties.k8sResource as WatchK8sResourceWithProp;
    const resource: WatchK8sResource = asWatchK8sResource(k8sResource);
    return {
      ...acc,
      [`${idx}-${k8sResource.prop}`]: resource,
    };
  }, {});

  const resources = useK8sWatchResources(resourcesMap);

  const k8sResourceActivities = useMemo(
    () =>
      resourceActivities
        ?.map((activity, index) => {
          const k8sResource = activity.properties.k8sResource as WatchK8sResourceWithProp;
          const k8sResources = get(
            resources,
            [asUniqueResource(k8sResource, index).prop, 'data'],
            [],
          ) as K8sResourceCommon[];
          return k8sResources
            ?.filter((resource) =>
              activity.properties.isActivity
                ? Boolean(activity.properties.isActivity(resource))
                : true,
            )
            .map((resource) => ({
              component: (activity as ResolvedExtension<DynamicDashboardsOverviewResourceActivity>)
                ?.properties?.component,
              loader: 'loader' in activity.properties ? activity.properties.loader : undefined,
              resource,
              timestamp: (activity.properties.getTimestamp
                ? activity.properties.getTimestamp(resource)
                : null) as Date | null,
            }));
        })
        ?.reduce((a, b) => a.concat(b), []),
    [resourceActivities, resources],
  );

  const resourcesLoaded = useMemo(
    () =>
      resourceActivities?.every((activity, index) => {
        const k8sResource = activity.properties.k8sResource as WatchK8sResourceWithProp;
        const uniqueProp = asUniqueResource(k8sResource, index).prop;
        return resources[uniqueProp]?.loaded || resources[uniqueProp]?.loadError;
      }),
    [resourceActivities, resources],
  );

  return {
    k8sResourceActivities,
    k8sResources: resources,
    k8sResourcesLoaded: resourcesLoaded,
  };
};

export default useDashboardK8sResources;
