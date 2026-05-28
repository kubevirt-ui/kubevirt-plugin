import { useMemo } from 'react';

import {
  modelToGroupVersionKind,
  VolumeSnapshotModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

import { VolumeSnapshotKind } from './types';

type ProjectSnapshotCount = {
  count: number;
  name: string;
};

type UseSnapshotsReturnType = {
  error: Error;
  projectsLoaded: boolean;
  projectsWithSnapshots: ProjectSnapshotCount[];
  snapshots: VolumeSnapshotKind[];
  snapshotsLoaded: boolean;
};

const useSnapshots = (projectSelected: string, cluster?: string): UseSnapshotsReturnType => {
  const [allSnapshots, allSnapshotsLoaded, allSnapshotsErrors] = useK8sWatchData<
    VolumeSnapshotKind[]
  >({
    cluster,
    groupVersionKind: modelToGroupVersionKind(VolumeSnapshotModel),
    isList: true,
    namespace: '',
    namespaced: true,
  });

  const projectsWithSnapshots = useMemo(() => {
    const countByNamespace = (allSnapshots || []).reduce<Record<string, number>>(
      (acc, snapshot) => {
        const ns = getNamespace(snapshot);
        if (ns) {
          acc[ns] = (acc[ns] || 0) + 1;
        }
        return acc;
      },
      {},
    );

    return Object.entries(countByNamespace)
      .map(([name, count]) => ({ count, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allSnapshots]);

  const snapshotWatchResource = projectSelected
    ? {
        cluster,
        groupVersionKind: modelToGroupVersionKind(VolumeSnapshotModel),
        isList: true,
        namespace: projectSelected,
        namespaced: true,
      }
    : null;

  const [snapshotsRaw, snapshotsLoaded, snapshotsErrors] =
    useK8sWatchData<VolumeSnapshotKind[]>(snapshotWatchResource);

  const snapshots = useMemo(
    () => (snapshotsRaw || [])?.sort((a, b) => a?.metadata?.name?.localeCompare(b?.metadata?.name)),
    [snapshotsRaw],
  );

  return {
    error: allSnapshotsErrors || snapshotsErrors,
    projectsLoaded: allSnapshotsLoaded,
    projectsWithSnapshots,
    snapshots,
    snapshotsLoaded,
  };
};

export default useSnapshots;
