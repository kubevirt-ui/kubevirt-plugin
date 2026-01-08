import { useMemo } from 'react';

import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useIsACMPage from '@multicluster/useIsACMPage';
import { K8sGroupVersionKind, useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';
import { OBJECTS_FETCHING_LIMIT } from '@virtualmachines/utils/constants';

type UseAccessibleResources<T> = {
  loaded: boolean;
  loadError?: any;
  resources: T[];
};

export const useAccessibleResources = <T>(
  groupVersionKind: K8sGroupVersionKind,
  cluster?: string,
): UseAccessibleResources<T> => {
  const isAdmin = useIsAdmin();
  const isACMPage = useIsACMPage();
  const [projectNames, projectNamesLoaded, projectNamesError] = useProjects();

  const loadPerNamespace = !isACMPage && projectNamesLoaded && !isAdmin;

  const shouldFetchClusterWide = isAdmin || isACMPage;
  const [allResources, allResourcesLoaded] = useKubevirtWatchResource<T[]>(
    shouldFetchClusterWide
      ? {
          cluster,
          groupVersionKind,
          isList: true,
          limit: OBJECTS_FETCHING_LIMIT,
        }
      : null,
  );

  const allowedResources = useK8sWatchResources<{ [key: string]: T[] }>(
    Object.fromEntries(
      loadPerNamespace
        ? (projectNames || []).map((namespace) => [
            namespace,
            {
              groupVersionKind,
              isList: true,
              namespace,
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
