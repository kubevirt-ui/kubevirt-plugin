import { WatchK8sResources } from '@openshift-console/dynamic-plugin-sdk';

import { K8sResourceKind } from '../../../../../clusteroverview/utils/types';
import {
  getPodsForCronJob,
  getPodsForDaemonSet,
  getPodsForDeployment,
  getPodsForDeploymentConfig,
  getPodsForResource,
  getPodsForStatefulSet,
} from '../../../resource-utils';
import { PodKind, PodRCData } from '../../../types/podTypes';

/**
 * Extract the resources from `getResourcesToWatchForPods` which are watched with `useK8sWatchResources`.
 */
export const getPodsDataForResource = (
  resource: K8sResourceKind,
  kind: string,
  resources: any,
): PodRCData => {
  switch (kind) {
    case 'DeploymentConfig':
      return getPodsForDeploymentConfig(resource, resources);
    case 'Deployment':
      return getPodsForDeployment(resource, resources);
    case 'StatefulSet':
      return getPodsForStatefulSet(resource, resources);
    case 'DaemonSet':
      return getPodsForDaemonSet(resource, resources);
    case 'CronJob':
      return getPodsForCronJob(resource, resources);
    case 'Pod':
      return {
        obj: resource,
        current: undefined,
        previous: undefined,
        isRollingOut: true,
        pods: [resource as PodKind],
      };
    default:
      return {
        obj: resource,
        current: undefined,
        previous: undefined,
        isRollingOut: undefined,
        pods: getPodsForResource(resource, resources),
      };
  }
};

/**
 * Return a `WatchK8sResources` object for `useK8sWatchResources` to get all related `Pods`
 * for a given kind and namespace.
 *
 * - It watches for all `Pods` and all `ReplicationControllers` for a `DeploymentConfig`
 * - It watches for all `Pods` and all `ReplicaSets` for a `Deployment`
 * - It watches for all `Pods` and all `StatefulSets` for a `StatefulSet`
 * - It watches for all `Pods` and all `Jobs` for a `CronJob`
 * - And it watches for all `Pods` for all other kinds, or when no kind is provided.
 *
 * See also `getPodsDataForResource` above
 */
export const getResourcesToWatchForPods = (
  kind: string,
  namespace: string,
): WatchK8sResources<any> => {
  if (!kind) {
    return {
      pods: {
        isList: true,
        kind: 'Pod',
        namespace,
      },
    };
  }
  switch (kind) {
    case 'DeploymentConfig':
      return {
        pods: {
          isList: true,
          kind: 'Pod',
          namespace,
        },
        replicationControllers: {
          isList: true,
          kind: 'ReplicationController',
          namespace,
        },
      };
    case 'Deployment':
      return {
        pods: {
          isList: true,
          kind: 'Pod',
          namespace,
        },
        replicaSets: {
          isList: true,
          kind: 'ReplicaSet',
          namespace,
        },
      };
    case 'StatefulSet':
      return {
        pods: {
          isList: true,
          kind: 'Pod',
          namespace,
        },
        statefulSets: {
          isList: true,
          kind: 'StatefulSet',
          namespace,
        },
      };
    case 'CronJob':
      return {
        pods: {
          isList: true,
          kind: 'Pod',
          namespace,
        },
        jobs: {
          isList: true,
          kind: 'Job',
          namespace,
        },
      };
    default:
      return {
        pods: {
          isList: true,
          kind: 'Pod',
          namespace,
        },
      };
  }
};
