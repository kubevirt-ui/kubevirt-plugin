import { useMemo } from 'react';

import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useIsACMPage from '@multicluster/useIsACMPage';
import {
  K8sGroupVersionKind,
  K8sResourceCommon,
  useK8sWatchResources,
} from '@openshift-console/dynamic-plugin-sdk';
import { OBJECTS_FETCHING_LIMIT } from '@virtualmachines/utils/constants';

type FilterOptions = { [key: string]: string };

export type UseAccessibleResourcesOptions = {
  /**
   * Managed cluster to scope the watch. Pass `undefined` for fleet-wide / all-clusters multicluster
   * search (callers e.g. search UI decide when that applies). This hook does not read the URL.
   */
  cluster?: string;
  filterOptions?: FilterOptions;
  /**
   * When non-empty, fleet search uses these cluster names and the watch `cluster` field stays unset.
   */
  fleetClusterNames?: string[];
};

type UseAccessibleResources = <T extends K8sResourceCommon>(
  groupVersionKind: K8sGroupVersionKind,
  options?: UseAccessibleResourcesOptions,
) => {
  loaded: boolean;
  loadError?: unknown;
  resources: T[];
};

export const useAccessibleResources: UseAccessibleResources = <T extends K8sResourceCommon>(
  groupVersionKind: K8sGroupVersionKind,
  options?: UseAccessibleResourcesOptions,
) => {
  const { cluster: clusterScope, filterOptions, fleetClusterNames } = options ?? {};

  const isAdmin = useIsAdmin();
  const isACMPage = useIsACMPage();
  const [projectNames, projectNamesLoaded, projectNamesError] = useProjects();

  const loadPerNamespace = !isACMPage && projectNamesLoaded && !isAdmin;

  const shouldFetchClusterWide = isAdmin || isACMPage;
  const hasFleetFilter = Boolean(fleetClusterNames?.length);
  const watchCluster = hasFleetFilter ? undefined : clusterScope;

  const [allResources, allResourcesLoaded] = useKubevirtWatchResource<T[]>(
    shouldFetchClusterWide
      ? {
          cluster: watchCluster,
          groupVersionKind,
          isList: true,
          limit: OBJECTS_FETCHING_LIMIT,
        }
      : null,
    filterOptions,
    hasFleetFilter ? [{ property: 'cluster', values: fleetClusterNames }] : null,
  );

  const allowedResources = useK8sWatchResources<{ [key: string]: T[] }>(
    Object.fromEntries(
      loadPerNamespace
        ? (projectNames || []).map((ns) => [
            ns,
            {
              groupVersionKind,
              isList: true,
              namespace: ns,
            },
          ])
        : [],
    ),
  );

  const resources = useMemo(() => {
    const aggregated = loadPerNamespace
      ? Object.values(allowedResources).flatMap((resource) => resource.data || [])
      : allResources;
    return aggregated || [];
  }, [allResources, allowedResources, loadPerNamespace]);

  const loaded =
    projectNamesLoaded &&
    (loadPerNamespace
      ? isEmpty(allowedResources) ||
        Object.values(allowedResources).some((resource) => resource.loaded || resource.loadError)
      : allResourcesLoaded);

  return { loaded, loadError: projectNamesError, resources };
};
