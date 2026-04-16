import { useMemo } from 'react';

import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import { KubevirtDataPodFilters } from '@kubevirt-utils/hooks/useKubevirtDataPod/useKubevirtDataPodFilters';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useProjects from '@kubevirt-utils/hooks/useProjects';
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
  searchQueries?: AdvancedSearchFilter;
  selector?: Selector;
};

type UseAccessibleResources = <T extends K8sResourceCommon>(
  args: UseAccessibleResourcesArgs,
) => {
  loaded: boolean;
  loadError?: any;
  resources: T[];
};

export const useAccessibleResources: UseAccessibleResources = <T>({
  clusters,
  fieldSelector,
  filterOptions,
  groupVersionKind,
  namespace,
  searchQueries,
  selector,
}) => {
  const isAdmin = useIsAdmin();
  const isACMPage = useIsACMPage();
  const cluster = useClusterParam();
  const [projectNames, projectNamesLoaded, projectNamesError] = useProjects();

  const loadPerNamespace = !isACMPage && projectNamesLoaded && !isAdmin;

  const shouldFetchClusterWide = isAdmin || isACMPage;
  const [allResources, allResourcesLoaded] = useKubevirtWatchResource<T[]>(
    shouldFetchClusterWide
      ? {
          cluster: clusters ? undefined : cluster,
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
    const vms = loadPerNamespace
      ? Object.values(allowedResources).flatMap((resource) => resource.data || [])
      : allResources;
    return vms || [];
  }, [allResources, allowedResources, loadPerNamespace]);

  const loaded =
    projectNamesLoaded &&
    (loadPerNamespace
      ? isEmpty(allowedResources) ||
        Object.values(allowedResources).some((resource) => resource.loaded || resource.loadError)
      : allResourcesLoaded);

  return { loaded, loadError: projectNamesError, resources };
};
