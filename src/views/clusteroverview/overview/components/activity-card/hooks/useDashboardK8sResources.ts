import * as React from 'react';

import { get } from '@kubevirt-utils/utils/utils';
import {
  DashboardsOverviewResourceActivity as DynamicDashboardsOverviewResourceActivity,
  FirehoseResource,
  FirehoseResult,
  ResolvedExtension,
  useK8sWatchResources,
  WatchK8sResource,
} from '@openshift-console/dynamic-plugin-sdk';

import { asUniqueResource, asWatchK8sResource } from '../utils/utils';

import useDashboardActivities from './useDashboardActivities';

const useDashboardK8sResources = () => {
  const { resourceActivities } = useDashboardActivities();

  const resourcesMap = resourceActivities?.reduce((acc, activity, idx) => {
    // TODO Fix typing
    const firehoseResource: FirehoseResource = activity?.properties
      ?.k8sResource as unknown as FirehoseResource;
    const resource: WatchK8sResource = asWatchK8sResource(firehoseResource);
    return {
      ...acc,
      [`${idx}-${firehoseResource.prop}`]: resource,
    };
  }, {});

  const resources = useK8sWatchResources(resourcesMap);

  const k8sResourceActivities = React.useMemo(
    () =>
      resourceActivities
        ?.map((activity, index) => {
          // TODO Fix typing
          const firehoseResource: FirehoseResource = activity?.properties
            ?.k8sResource as unknown as FirehoseResource;
          const k8sResources = get(
            resources,
            [asUniqueResource(firehoseResource, index).prop, 'data'],
            [],
          ) as FirehoseResult['data'];
          return k8sResources
            ?.filter((r) =>
              activity.properties.isActivity ? activity.properties.isActivity(r) : true,
            )
            .map((r) => ({
              resource: r,
              timestamp: activity.properties.getTimestamp
                ? activity.properties.getTimestamp(r)
                : null,
              // TODO Fix typing
              // skipcq: JS-0349
              loader: (activity as any)?.properties?.loader,
              // loader: (a as DashboardsOverviewResourceActivity)?.properties?.loader,
              component: (activity as ResolvedExtension<DynamicDashboardsOverviewResourceActivity>)
                ?.properties?.component,
            }));
        })
        ?.reduce((a, b) => a.concat(b), []),
    [resourceActivities, resources],
  );

  const resourcesLoaded = React.useMemo(
    () =>
      resourceActivities?.every((activity, index) => {
        // TODO Fix typing
        const firehoseResource: FirehoseResource = activity?.properties
          ?.k8sResource as unknown as FirehoseResource;
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
