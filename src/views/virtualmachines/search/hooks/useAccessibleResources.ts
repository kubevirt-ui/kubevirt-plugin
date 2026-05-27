import { useMemo } from 'react';

import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { KubevirtDataPodFilters } from '@kubevirt-utils/hooks/useKubevirtDataPod/useKubevirtDataPodFilters';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useNamespaces from '@kubevirt-utils/hooks/useNamespaces';
import { isSystemNamespace } from '@kubevirt-utils/resources/namespace/helper';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useIsACMPage from '@multicluster/useIsACMPage';
import {
  K8sGroupVersionKind,
  Selector,
  useK8sWatchResources,
} from '@openshift-console/dynamic-plugin-sdk';
import { AdvancedSearchFilter } from '@stolostron/multicluster-sdk';
import { getSearchQueries } from '@virtualmachines/search/utils';
import { OBJECTS_FETCHING_LIMIT } from '@virtualmachines/utils/constants';

type UseAccessibleResourcesArgs = {
  clusters?: string[];
  fieldSelector?: string;
  filterOptions?: KubevirtDataPodFilters;
  groupVersionKind: K8sGroupVersionKind;
  namespace?: string;
  onlyUserNamespaces?: boolean;
  searchQueries?: AdvancedSearchFilter;
  selector?: Selector;
  watchNamespaces?: string[];
};

type UseAccessibleResourcesReturn<T> = {
  loaded: boolean;
  loadError?: any;
  resources: T[];
};

export const useAccessibleResources = <T>({
  clusters,
  fieldSelector,
  filterOptions,
  groupVersionKind,
  namespace,
  onlyUserNamespaces,
  searchQueries,
  selector,
  watchNamespaces,
}: UseAccessibleResourcesArgs): UseAccessibleResourcesReturn<T> => {
  const isAdmin = useIsAdmin();
  const isACMPage = useIsACMPage();
  const cluster = useClusterParam();
  const [namespaceNames, namespaceNamesLoaded, namespaceNamesError] = useNamespaces();

  const clusterToWatch = useMemo(() => {
    if (clusters?.length === 1) return clusters[0];
    return clusters ? undefined : cluster;
  }, [clusters, cluster]);

  const namespacesToWatch = useMemo(() => {
    if (watchNamespaces) return watchNamespaces;
    if (!onlyUserNamespaces || !namespaceNames) return namespaceNames;
    return namespaceNames.filter((ns) => !isSystemNamespace(ns));
  }, [onlyUserNamespaces, namespaceNames, watchNamespaces]);

  const loadPerNamespace = !isACMPage && namespaceNamesLoaded && !isAdmin;

  const shouldFetchClusterWide = isAdmin || isACMPage;
  const [allResources, allResourcesLoaded] = useKubevirtWatchResource<T[]>(
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

  const loaded =
    namespaceNamesLoaded &&
    (loadPerNamespace
      ? isEmpty(allowedResources) ||
        Object.values(allowedResources).some((resource) => resource.loaded || resource.loadError)
      : allResourcesLoaded);

  return { loaded, loadError: namespaceNamesError, resources };
};
