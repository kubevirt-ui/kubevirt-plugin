import { useMemo } from 'react';

import {
  VirtualMachineInstanceModelGroupVersionKind,
  VirtualMachineModelGroupVersionKind,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useIsAdmin } from '@kubevirt-utils/hooks/useIsAdmin';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import useIsACMPage from '@multicluster/useIsACMPage';
import { K8sGroupVersionKind, useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';
import { OBJECTS_FETCHING_LIMIT } from '@virtualmachines/utils/constants';

type UseAccessibleResources<T> = {
  loaded: boolean;
  resources: T[];
};

const useAccessibleResources = <T>(
  groupVersionKind: K8sGroupVersionKind,
): UseAccessibleResources<T> => {
  const isAdmin = useIsAdmin();
  const isACMPage = useIsACMPage();
  const [projectNames, projectNamesLoaded] = useProjects();

  const loadPerNamespace = !isACMPage && projectNamesLoaded && !isAdmin;

  const [allResources, allResourcesLoaded] = useKubevirtWatchResource<T[]>({
    groupVersionKind,
    isList: true,
    limit: OBJECTS_FETCHING_LIMIT,
  });

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
    if (!loadPerNamespace) {
      return allResources || [];
    }

    return Object.values(allowedResources).flatMap((resource) => resource.data || []);
  }, [loadPerNamespace, allResources, allowedResources]);

  const loaded = !loadPerNamespace ? allResourcesLoaded : projectNamesLoaded;

  return { loaded, resources };
};

type UseAccessibleVMs = {
  vms: V1VirtualMachine[];
  vmsLoaded: boolean;
};

type UseAccessibleVMIs = {
  vmis: V1VirtualMachineInstance[];
  vmisLoaded: boolean;
};

export const useAccessibleVMs = (): UseAccessibleVMs => {
  const { loaded: vmsLoaded, resources: vms } = useAccessibleResources<V1VirtualMachine>(
    VirtualMachineModelGroupVersionKind,
  );

  return { vms, vmsLoaded };
};

export const useAccessibleVMIs = (): UseAccessibleVMIs => {
  const { loaded: vmisLoaded, resources: vmis } = useAccessibleResources<V1VirtualMachineInstance>(
    VirtualMachineInstanceModelGroupVersionKind,
  );

  return { vmis, vmisLoaded };
};
