import { useEffect, useMemo } from 'react';

import {
  VirtualMachineInstanceMigrationModelGroupVersionKind,
  VirtualMachineModelGroupVersionKind,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  type V1VirtualMachine,
  type V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { runningTourSignal } from '@kubevirt-utils/components/GuidedTour/utils/guidedTourSignals';
import { useCanListNamespaces } from '@kubevirt-utils/hooks/useCanListNamespaces';
import { TREE_VIEW_FOLDERS } from '@kubevirt-utils/hooks/useFeatures/constants';
import { useFeatures } from '@kubevirt-utils/hooks/useFeatures/useFeatures';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useProjects from '@kubevirt-utils/hooks/useProjects';
import { getName } from '@kubevirt-utils/resources/shared';
import { isEmpty, universalComparator } from '@kubevirt-utils/utils/utils';
import useMulticlusterNamespaces from '@multicluster/hooks/useMulticlusterNamespaces';
import useIsACMPage from '@multicluster/useIsACMPage';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetClusterNames } from '@stolostron/multicluster-sdk';
import { getLatestMigrationForEachVM } from '@virtualmachines/utils';

import { isHardInventoryError } from '../utils/isHardInventoryError';
import { vmimMapperSignal, vmsSignal } from '../utils/signals';
import { toError } from '../utils/toError';
import { toUnknown } from '../utils/toUnknown';
import { updateFleetVMInventory } from '../utils/updateFleetVMInventory';
import { allClustersWatch, buildNamespacedListWatch } from './treeViewWatchConfigs';

export type UseTreeViewDataResources = {
  clusterNames: string[];
  isACMTreeView: boolean;
  isTourRunning: boolean;
  loaded: boolean;
  loadError: unknown;
  namespacesByCluster: Record<string, K8sResourceCommon[]>;
  projectNames: string[];
  treeViewFoldersEnabled: boolean;
  vms: V1VirtualMachine[];
};

export const useTreeViewDataResources = (): UseTreeViewDataResources => {
  const canListAllNamespaces = useCanListNamespaces();
  const [clusterNames] = useFleetClusterNames();
  const isACMTreeView = useIsACMPage();
  const isTourRunning = runningTourSignal.value;
  const { featureEnabled: treeViewFoldersEnabled } = useFeatures(TREE_VIEW_FOLDERS);
  const [projectNames, projectNamesLoaded, projectNamesError] = useProjects();
  const namespacesResult = useMulticlusterNamespaces();
  const { loaded: multiclusterNamespacesLoaded, namespacesByCluster } = namespacesResult;

  const loadVMsPerNamespace = !isACMTreeView && projectNamesLoaded && !canListAllNamespaces;
  const clusterScopedEnabled = canListAllNamespaces || isACMTreeView;

  const [allVMs, allVMsLoaded, allVMsError, refreshAllVMs] = useKubevirtWatchResource<
    V1VirtualMachine[]
  >(allClustersWatch(clusterScopedEnabled, VirtualMachineModelGroupVersionKind));

  const allowedResources = useK8sWatchResources<{ [key: string]: V1VirtualMachine[] }>(
    buildNamespacedListWatch(
      loadVMsPerNamespace,
      projectNames ?? [],
      VirtualMachineModelGroupVersionKind,
    ),
  );

  const [allVMIM] = useKubevirtWatchResource<V1VirtualMachineInstanceMigration[]>(
    allClustersWatch(clusterScopedEnabled, VirtualMachineInstanceMigrationModelGroupVersionKind),
  );

  const allowedVMIMResources = useK8sWatchResources<{
    [key: string]: V1VirtualMachineInstanceMigration[];
  }>(
    buildNamespacedListWatch(
      loadVMsPerNamespace,
      projectNames ?? [],
      VirtualMachineInstanceMigrationModelGroupVersionKind,
    ),
  );

  const memoizedVMIMs = useMemo(
    () =>
      getLatestMigrationForEachVM(
        loadVMsPerNamespace
          ? Object.values(allowedVMIMResources).flatMap((resource) => resource.data ?? [])
          : (allVMIM ?? []),
      ),
    [allVMIM, allowedVMIMResources, loadVMsPerNamespace],
  );

  const sortedMemoizedVMs = useMemo((): V1VirtualMachine[] => {
    const vms = loadVMsPerNamespace
      ? Object.values(allowedResources).flatMap((resource) => resource.data ?? [])
      : allVMs;
    return (vms ?? []).filter(Boolean).sort((a, b) => universalComparator(getName(a), getName(b)));
  }, [allVMs, allowedResources, loadVMsPerNamespace]);

  useEffect(() => {
    vmimMapperSignal.value = memoizedVMIMs;
  }, [memoizedVMIMs]);

  const namespacedVMsLoaded = loadVMsPerNamespace
    ? isEmpty(allowedResources) ||
      Object.values(allowedResources).every((resource) => resource.loaded || resource.loadError)
    : allVMsLoaded;

  const namespacedVMsError: unknown = loadVMsPerNamespace
    ? Object.values(allowedResources)
        .map((resource) => resource.loadError as unknown)
        .find(Boolean)
    : allVMsError;

  const vmWatchError = toError(namespacedVMsError);
  const hardVMError = vmWatchError && isHardInventoryError(vmWatchError) ? vmWatchError : undefined;

  useEffect(() => {
    updateFleetVMInventory({
      error: vmWatchError,
      loaded: namespacedVMsLoaded,
      refresh: refreshAllVMs,
      vms: sortedMemoizedVMs,
    });
  }, [vmWatchError, namespacedVMsLoaded, refreshAllVMs, sortedMemoizedVMs]);

  // Prefer live watch data; on soft refresh failure keep last successful inventory for the tree.
  const displayVMs = useMemo(() => {
    if (hardVMError) {
      return [];
    }
    if (vmWatchError && sortedMemoizedVMs.length === 0 && vmsSignal.value.length > 0) {
      return vmsSignal.value;
    }
    return sortedMemoizedVMs;
  }, [hardVMError, vmWatchError, sortedMemoizedVMs]);

  const projectsLoaded = isACMTreeView ? multiclusterNamespacesLoaded : projectNamesLoaded;

  const loaded = projectsLoaded && (namespacedVMsLoaded || displayVMs.length > 0);

  return {
    clusterNames,
    isACMTreeView,
    isTourRunning,
    loaded,
    loadError: projectNamesError ?? toUnknown(namespacesResult.error) ?? toUnknown(hardVMError),
    namespacesByCluster,
    projectNames,
    treeViewFoldersEnabled,
    vms: displayVMs,
  };
};
