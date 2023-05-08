import React from 'react';

import { useK8sWatchResources } from '@console/internal/components/hooks/k8s-watch-hook';
import {
  CronJobModel,
  DaemonSetModel,
  DeploymentConfigModel,
  DeploymentModel,
  JobModel,
  PodModel,
  StatefulSetModel,
} from '@console/internal/models';
import {
  BuildConfigData,
  getPodsForResource,
  getResourcesToWatchForPods,
  useBuildConfigsWatcher,
  useJobsForCronJobWatcher,
  usePodsWatcher,
} from '@console/shared';
import {
  AdapterDataType,
  K8sResourceCommon,
  NetworkAdapterType,
  PodsAdapterDataType,
  ResolvedExtension,
} from '@openshift-console/dynamic-plugin-sdk';
import { Extension } from '@openshift-console/dynamic-plugin-sdk/src/types';
import { GraphElement } from '@patternfly/react-topology';

import { getResource } from '../../utils';

export const getDataFromAdapter = <T extends { resource: K8sResourceCommon }, E extends Extension>(
  element: GraphElement,
  [resolvedExtensions, loaded]: [ResolvedExtension<E>[], boolean],
): T | undefined =>
  loaded
    ? resolvedExtensions.reduce<T>((acc, { properties: { adapt } }) => {
        const values = (adapt as (element: GraphElement) => T)(element);
        return values ?? acc;
      }, undefined)
    : undefined;

const usePodsAdapterForWorkloads = (resource: K8sResourceCommon): PodsAdapterDataType => {
  const buildConfigData = useBuildConfigsWatcher(resource);
  const { podData, loaded, loadError } = usePodsWatcher(resource);
  return React.useMemo(
    () => ({ pods: podData?.pods, loaded, loadError, buildConfigData }),
    [buildConfigData, loadError, loaded, podData],
  );
};

export const podsAdapterForWorkloads = (
  element: GraphElement,
): AdapterDataType<PodsAdapterDataType> | undefined => {
  const resource = getResource(element);
  if (!resource) {
    return undefined;
  }
  if (
    !resource ||
    ![
      DeploymentConfigModel.kind,
      DeploymentModel.kind,
      DaemonSetModel.kind,
      StatefulSetModel.kind,
      JobModel.kind,
      PodModel.kind,
    ].includes(resource.kind)
  )
    return undefined;
  return { resource, provider: usePodsAdapterForWorkloads };
};

export const buildsAdapterForWorkloads = (
  element: GraphElement,
): AdapterDataType<BuildConfigData> | undefined => {
  const resource = getResource(element);
  if (!resource) {
    return undefined;
  }
  if (
    !resource ||
    ![
      DeploymentConfigModel.kind,
      DeploymentModel.kind,
      DaemonSetModel.kind,
      StatefulSetModel.kind,
      CronJobModel.kind,
    ].includes(resource.kind)
  )
    return undefined;
  return { resource, provider: useBuildConfigsWatcher };
};

export const networkAdapterForWorkloads = (
  element: GraphElement,
): NetworkAdapterType | undefined => {
  const resource = getResource(element);
  if (!resource) {
    return undefined;
  }
  if (
    !resource ||
    ![
      DeploymentConfigModel.kind,
      DeploymentModel.kind,
      DaemonSetModel.kind,
      StatefulSetModel.kind,
      PodModel.kind,
    ].includes(resource.kind)
  )
    return undefined;
  return { resource };
};

const usePodsAdapterForCronJobWorkloads = (resource: K8sResourceCommon): PodsAdapterDataType => {
  const { jobs } = useJobsForCronJobWatcher(resource);
  const {
    metadata: { namespace },
  } = resource;

  const [pods, setPods] = React.useState([]);
  const [loaded, setLoaded] = React.useState<boolean>(false);
  const [loadError, setLoadError] = React.useState<string>('');
  const watchedResources = React.useMemo(
    () => getResourcesToWatchForPods('CronJob', namespace),
    [namespace],
  );

  const resources = useK8sWatchResources(watchedResources);

  React.useEffect(() => {
    const errorKey = Object.keys(resources).find((key) => resources[key].loadError);
    if (errorKey) {
      setLoadError(resources[errorKey].loadError);
      return;
    }
    setLoadError('');
    if (
      Object.keys(resources).length > 0 &&
      Object.keys(resources).every((key) => resources[key].loaded)
    ) {
      const updatedPods = jobs?.length
        ? jobs.reduce((acc, res) => {
            acc.push(...getPodsForResource(res, resources));
            return acc;
          }, [])
        : [];
      setPods(updatedPods);
      setLoaded(true);
    }
  }, [jobs, resources]);
  return { pods, loaded, loadError };
};

export const podsAdapterForCronJobWorkload = (
  element: GraphElement,
): AdapterDataType<PodsAdapterDataType> | undefined => {
  const resource = getResource(element);
  if (!resource || resource.kind !== CronJobModel.kind) return undefined;
  return { resource, provider: usePodsAdapterForCronJobWorkloads };
};
