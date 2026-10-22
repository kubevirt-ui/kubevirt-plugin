import { useMemo } from 'react';

import { useCanListNamespaces } from '@kubevirt-utils/hooks/useCanListNamespaces';
import { type KubevirtDataPodFilters } from '@kubevirt-utils/hooks/useKubevirtDataPod/types';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import { isSystemNamespace } from '@kubevirt-utils/resources/namespace/helper';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useIsACMPage from '@multicluster/useIsACMPage';
import {
  type K8sGroupVersionKind,
  type Selector,
  useK8sWatchResources,
} from '@openshift-console/dynamic-plugin-sdk';
import { type AdvancedSearchFilter } from '@stolostron/multicluster-sdk';
import { getSearchQueries } from '@virtualmachines/search/utils';
import { OBJECTS_FETCHING_LIMIT } from '@virtualmachines/utils/constants';

type UseAccessibleResourcesArgs = {
  clusters?: string[];
  /** When false, skips watches (e.g. ACM consumers reusing Fleet tree inventory). */
  enabled?: boolean;
  fieldSelector?: string;
  filterOptions?: KubevirtDataPodFilters;
  groupVersionKind: K8sGroupVersionKind;
  namespace?: string;
  onlyUserProjects?: boolean;
  searchQueries?: AdvancedSearchFilter;
  selector?: Selector;
  watchNamespaces?: string[];
};

type UseAccessibleResourcesReturn<T> = {
  loaded: boolean;
  loadError?: Error;
  resources: T[];
};

export const useAccessibleResources = <T>({
  clusters,
  enabled = true,
  fieldSelector,
  filterOptions,
  groupVersionKind,
  namespace,
  onlyUserProjects,
  searchQueries,
  selector,
  watchNamespaces,
}: UseAccessibleResourcesArgs): UseAccessibleResourcesReturn<T> => {
  const canListAllNamespaces = useCanListNamespaces();
  const isACMPage = useIsACMPage();
  const cluster = useClusterParam();
  const [projectNames, projectNamesLoaded, projectNamesError] = useProjects();

  const clusterToWatch = useMemo(() => {
    if (clusters?.length === 1) return clusters[0];
    return clusters ? undefined : cluster;
  }, [clusters, cluster]);

  const namespacesToWatch = useMemo(() => {
    if (watchNamespaces) return watchNamespaces;
    if (!onlyUserProjects || !projectNames) return projectNames;
    return projectNames.filter((ns) => !isSystemNamespace(ns));
  }, [onlyUserProjects, projectNames, watchNamespaces]);

  const loadPerNamespace = enabled && !isACMPage && projectNamesLoaded && !canListAllNamespaces;

  const shouldFetchClusterWide = enabled && (canListAllNamespaces || isACMPage);
  const [allResources, allResourcesLoaded, allResourcesLoadError] = useKubevirtWatchResource<T[]>(
    shouldFetchClusterWide
      ? {
          cluster: clusterToWatch,
          fieldSelector,
          groupVersionKind,
          isList: true,
          limit: OBJECTS_FETCHING_LIMIT,
          namespace,
          namespaced: Boolean(namespace),
          selector,
        }
      : null,
    filterOptions,
    getSearchQueries(searchQueries, clusters),
  );

  const allowedResources = useK8sWatchResources<{ [key: string]: T[] }>(
    Object.fromEntries(
      loadPerNamespace
        ? (namespacesToWatch || []).map((ns) => [
            ns,
            {
              fieldSelector,
              groupVersionKind,
              isList: true,
              namespace: ns,
              selector,
            },
          ])
        : [],
    ),
  );

  const resources = useMemo(() => {
    const vms = loadPerNamespace
      ? Object.values(allowedResources).flatMap((resource) => resource.data || [])
      : allResources;
    return vms || [];
  }, [allResources, allowedResources, loadPerNamespace]);

  let loaded = true;
  if (enabled && shouldFetchClusterWide) {
    loaded = allResourcesLoaded || !!allResourcesLoadError;
  } else if (enabled) {
    loaded =
      projectNamesLoaded &&
      (isEmpty(allowedResources) ||
        Object.values(allowedResources).some((resource) => resource.loaded || resource.loadError));
  }

  let loadError: Error | undefined;
  if (enabled && shouldFetchClusterWide) {
    loadError = allResourcesLoadError;
  } else if (enabled) {
    loadError = projectNamesError;
  }

  return { loaded, loadError, resources: enabled ? resources : [] };
};
