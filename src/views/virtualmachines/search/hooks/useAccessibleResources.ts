import { useMemo } from 'react';

import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useIsACMPage from '@multicluster/useIsACMPage';
import {
  K8sGroupVersionKind,
  K8sResourceCommon,
  useK8sWatchResources,
} from '@openshift-console/dynamic-plugin-sdk';
import { OBJECTS_FETCHING_LIMIT } from '@virtualmachines/utils/constants';

type FilterOptions = { [key: string]: string };

type UseAccessibleResources = <T extends K8sResourceCommon>(
  groupVersionKind: K8sGroupVersionKind,
  filterOptions?: FilterOptions,
  clusters?: string[],
) => {
  loaded: boolean;
  loadError?: unknown;
  resources: T[];
};

export const useAccessibleResources: UseAccessibleResources = <T extends K8sResourceCommon>(
  groupVersionKind: K8sGroupVersionKind,
  filterOptions?: FilterOptions,
  clusters?: string[],
) => {
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
          groupVersionKind,
          isList: true,
          limit: OBJECTS_FETCHING_LIMIT,
        }
      : null,
    filterOptions,
    clusters ? [{ property: 'cluster', values: clusters }] : null,
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
