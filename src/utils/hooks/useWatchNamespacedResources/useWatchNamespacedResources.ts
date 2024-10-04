import { useMemo } from 'react';

import { modelToGroupVersionKind, ProjectModel } from '@kubevirt-utils/models';
import {
  K8sResourceCommon,
  useK8sWatchResource,
  useK8sWatchResources,
  WatchK8sResource,
} from '@openshift-console/dynamic-plugin-sdk';

import { useIsAdmin } from '../useIsAdmin';

import { createWatchNamespacedResources } from './utils';

const useWatchNamespacedResources = <T>(watchResources: null | WatchK8sResource) => {
  const isAdmin = useIsAdmin();

  const [projects, projectsLoaded, projectsError] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: modelToGroupVersionKind(ProjectModel),
    isList: true,
    namespaced: false,
  });

  const watchNamespacedResources = useMemo(
    () =>
      projectsLoaded ? createWatchNamespacedResources(watchResources, projects, isAdmin) : null,
    [projectsLoaded, watchResources, projects, isAdmin],
  );

  const namespacedResources = useK8sWatchResources<{ [key: string]: T[] }>(
    watchNamespacedResources,
  );

  const resources = useMemo(
    () =>
      Object.values(namespacedResources)
        .map((namespaceRequest) => namespaceRequest.data)
        .flat(),
    [namespacedResources],
  );
  const resourcesLoaded = useMemo(
    () => Object.values(namespacedResources).every((namespaceRequest) => namespaceRequest.loaded),
    [namespacedResources],
  );
  const resourcesError = useMemo(
    () => Object.values(namespacedResources).find((namespaceRequest) => namespaceRequest.loadError),
    [namespacedResources],
  );

  return [resources, resourcesLoaded && projectsLoaded, resourcesError || projectsError];
};

export default useWatchNamespacedResources;
