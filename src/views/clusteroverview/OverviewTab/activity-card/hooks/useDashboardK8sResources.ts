// @ai-rules:
// 1. [Pattern]: Activities come as a union of LoadedExtension | ResolvedExtension — `loader` is accessed via `in` operator since it's not on the resolved type.
// 2. [Type]: LegacyFirehoseResource mirrors the deprecated FirehoseResource shape for structural compatibility with utils.ts helpers.
import { type ComponentType, useMemo } from 'react';

import { get } from '@kubevirt-utils/utils/utils';
import {
  type DashboardsOverviewResourceActivity as DynamicDashboardsOverviewResourceActivity,
  type K8sResourceCommon,
  type ResolvedExtension,
  useK8sWatchResources,
  type WatchK8sResource,
} from '@openshift-console/dynamic-plugin-sdk';

import { asUniqueResource, asWatchK8sResource } from '../utils/utils';
import useDashboardActivities from './useDashboardActivities';

type LegacyFirehoseResource = {
  isList?: boolean;
  kind: string;
  prop: string;
};

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
    const firehoseResource = activity?.properties?.k8sResource as unknown as LegacyFirehoseResource;
    const resource: WatchK8sResource = asWatchK8sResource(firehoseResource);
    return {
      ...acc,
      [`${idx}-${firehoseResource.prop}`]: resource,
    };
  }, {});

  const resources = useK8sWatchResources(resourcesMap);

  const k8sResourceActivities = useMemo(
    () =>
      resourceActivities
        ?.map((activity, index) => {
          const firehoseResource = activity?.properties
            ?.k8sResource as unknown as LegacyFirehoseResource;
          const k8sResources = get(
            resources,
            [asUniqueResource(firehoseResource, index).prop, 'data'],
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
        const firehoseResource = activity?.properties
          ?.k8sResource as unknown as LegacyFirehoseResource;
        const uniqueProp = asUniqueResource(firehoseResource, index).prop;
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
