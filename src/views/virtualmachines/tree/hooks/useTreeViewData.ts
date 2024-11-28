import { useMemo } from 'react';

import { VirtualMachineModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import { useK8sWatchResource, useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';
import { OBJECTS_FETCHING_LIMIT } from '@virtualmachines/utils';

type UseTreeViewData = {
  isAdmin: boolean;
  loaded: boolean;
  loadError: any;
  projectNames: string[];
  vms: V1VirtualMachine[];
};

export const useTreeViewData = (): UseTreeViewData => {
  const isAdmin = useIsAdmin();

  const [projectNames, projectNamesLoaded, projectNamesError] = useProjects();

  const [allVMs, allVMsLoaded] = useK8sWatchResource<V1VirtualMachine[]>({
    groupVersionKind: VirtualMachineModelGroupVersionKind,
    isList: true,
    limit: OBJECTS_FETCHING_LIMIT,
  });

  // user has limited access, so we can only get vms from allowed namespaces
  const allowedResources = useK8sWatchResources<{ [key: string]: V1VirtualMachine[] }>(
    Object.fromEntries(
      projectNamesLoaded && !isAdmin
        ? (projectNames || []).map((namespace) => [
            namespace,
            {
              groupVersionKind: VirtualMachineModelGroupVersionKind,
              isList: true,
              namespace,
            },
          ])
        : [],
    ),
  );

  const memoizedVMs = useMemo(
    () => (isAdmin ? allVMs : Object.values(allowedResources).flatMap((resource) => resource.data)),
    [allVMs, allowedResources, isAdmin],
  );

  return {
    isAdmin,
    loaded:
      projectNamesLoaded &&
      (isAdmin
        ? allVMsLoaded
        : Object.values(allowedResources).some((resource) => resource.loaded)),
    loadError: projectNamesError,
    projectNames,
    vms: memoizedVMs,
  };
};