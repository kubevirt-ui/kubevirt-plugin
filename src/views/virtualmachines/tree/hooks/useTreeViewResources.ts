import { useEffect, useMemo } from 'react';

import {
  VirtualMachineInstanceMigrationModelGroupVersionKind,
  VirtualMachineModelGroupVersionKind,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  type V1VirtualMachine,
  type V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import { getName } from '@kubevirt-utils/resources/shared';
import { isEmpty, universalComparator } from '@kubevirt-utils/utils/utils';
import { useK8sWatchResources, type WatchK8sResource } from '@openshift-console/dynamic-plugin-sdk';
import { getLatestMigrationForEachVM, OBJECTS_FETCHING_LIMIT } from '@virtualmachines/utils';
import type { VMIMMapper } from '@virtualmachines/utils/mappers';

import { vmimMapperSignal, vmsSignal } from '../utils/signals';

type UseTreeViewResourcesArgs = {
  isACMTreeView: boolean;
  isAdmin: boolean;
  loadVMsPerNamespace: boolean;
  projectNames: string[];
};

type UseTreeViewResourcesResult = {
  allVMsLoaded: boolean;
  memoizedVMIMs: VMIMMapper;
  perNamespaceLoaded: boolean;
  sortedMemoizedVMs: V1VirtualMachine[];
};

export const useTreeViewResources = ({
  isACMTreeView,
  isAdmin,
  loadVMsPerNamespace,
  projectNames,
}: UseTreeViewResourcesArgs): UseTreeViewResourcesResult => {
  const [allVMs, allVMsLoaded] = useKubevirtWatchResource<V1VirtualMachine[]>(
    (isAdmin || isACMTreeView
      ? {
          groupVersionKind: VirtualMachineModelGroupVersionKind,
          isList: true,
          limit: OBJECTS_FETCHING_LIMIT,
        }
      : null) as WatchK8sResource,
  );

  const allowedResources = useK8sWatchResources<{ [key: string]: V1VirtualMachine[] }>(
    Object.fromEntries(
      loadVMsPerNamespace
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

  const [allVMIM] = useKubevirtWatchResource<V1VirtualMachineInstanceMigration[]>(
    (isAdmin || isACMTreeView
      ? {
          groupVersionKind: VirtualMachineInstanceMigrationModelGroupVersionKind,
          isList: true,
          limit: OBJECTS_FETCHING_LIMIT,
        }
      : null) as WatchK8sResource,
  );

  const allowedVMIMResources = useK8sWatchResources<{
    [key: string]: V1VirtualMachineInstanceMigration[];
  }>(
    Object.fromEntries(
      loadVMsPerNamespace
        ? (projectNames || []).map((namespace) => [
            namespace,
            {
              groupVersionKind: VirtualMachineInstanceMigrationModelGroupVersionKind,
              isList: true,
              namespace,
            },
          ])
        : [],
    ),
  );

  const memoizedVMIMs = useMemo(
    () =>
      getLatestMigrationForEachVM(
        loadVMsPerNamespace
          ? Object.values(allowedVMIMResources).flatMap((resource) => resource.data || [])
          : allVMIM || [],
      ),
    [allVMIM, allowedVMIMResources, loadVMsPerNamespace],
  );

  const sortedMemoizedVMs = useMemo(() => {
    const vms = loadVMsPerNamespace
      ? Object.values(allowedResources).flatMap((resource) => resource.data || [])
      : allVMs;
    return (vms || []).filter(Boolean).sort((a, b) => universalComparator(getName(a), getName(b)));
  }, [allVMs, allowedResources, loadVMsPerNamespace]);

  useEffect(() => {
    vmimMapperSignal.value = memoizedVMIMs;
  }, [memoizedVMIMs]);

  useEffect(() => {
    vmsSignal.value = sortedMemoizedVMs;
  }, [sortedMemoizedVMs]);

  const perNamespaceLoaded =
    isEmpty(allowedResources) ||
    Object.values(allowedResources).every((resource) => resource.loaded || resource.loadError);

  return { allVMsLoaded, memoizedVMIMs, perNamespaceLoaded, sortedMemoizedVMs };
};
