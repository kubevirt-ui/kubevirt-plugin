import { type WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';
import { OBJECTS_FETCHING_LIMIT } from '@virtualmachines/utils';

type NamespacedWatchMap = { [key: string]: WatchK8sResource };

export const buildNamespacedListWatch = (
  enabled: boolean,
  namespaces: string[],
  groupVersionKind: WatchK8sResource['groupVersionKind'],
): NamespacedWatchMap => {
  if (!enabled) {
    return {};
  }

  const resources: NamespacedWatchMap = {};
  for (const namespace of namespaces) {
    resources[namespace] = {
      groupVersionKind,
      isList: true,
      namespace,
    };
  }
  return resources;
};

export const allClustersWatch = (
  enabled: boolean,
  groupVersionKind: WatchK8sResource['groupVersionKind'],
): WatchK8sResource =>
  (enabled
    ? {
        groupVersionKind,
        isList: true,
        limit: OBJECTS_FETCHING_LIMIT,
      }
    : null) as WatchK8sResource;
