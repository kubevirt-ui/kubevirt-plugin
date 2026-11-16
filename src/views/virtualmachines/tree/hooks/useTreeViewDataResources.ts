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
import { useK8sWatchResources } from '@openshift-console/dynamic-plugin-sdk';
import {
  type ClusterSetData,
  useFleetClusterNames,
  useFleetClusterSetNames,
  useFleetClusterSets,
} from '@stolostron/multicluster-sdk';
import { getLatestMigrationForEachVM } from '@virtualmachines/utils';

import { type UseTreeViewDataResources } from '../types/types';
import { isHardInventoryError } from '../utils/isHardInventoryError';
import { vmimMapperSignal, vmsSignal } from '../utils/signals';
import { toError } from '../utils/toError';
import { toUnknown } from '../utils/toUnknown';
import { updateFleetVMInventory } from '../utils/updateFleetVMInventory';
import { allClustersWatch, buildNamespacedListWatch } from './treeViewWatchConfigs';

export const useTreeViewDataResources = (): UseTreeViewDataResources => {
  const canListAllNamespaces = useCanListNamespaces();
  const [clusterNames] = useFleetClusterNames();
  const [clusterSetNames, clusterSetNamesLoaded, clusterSetNamesError] =
    useFleetClusterSetNames() as [string[] | undefined, boolean, unknown];
  const [clusterSetData, clusterSetsLoaded, clusterSetsError] = useFleetClusterSets() as [
    ClusterSetData | undefined,
    boolean,
    unknown,
  ];
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

  const clusterSetsLoadedForTree = !isACMTreeView || (clusterSetNamesLoaded && clusterSetsLoaded);

  const loaded =
    projectsLoaded && clusterSetsLoadedForTree && (namespacedVMsLoaded || !isEmpty(displayVMs));

  const clusterSetLoadError = isACMTreeView
    ? toUnknown(clusterSetNamesError ?? clusterSetsError)
    : undefined;

  return {
    clusterNames,
    clusterSetData: clusterSetData ?? {},
    clusterSetNames: clusterSetNames ?? [],
    isACMTreeView,
    isTourRunning,
    loaded,
    loadError:
      projectNamesError ?? toUnknown(namespacesResult.error ?? hardVMError) ?? clusterSetLoadError,
    namespacesByCluster,
    projectNames,
    treeViewFoldersEnabled,
    vms: displayVMs,
  };
};
