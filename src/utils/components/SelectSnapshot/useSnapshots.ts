import { useMemo } from 'react';

import {
  modelToGroupVersionKind,
  VolumeSnapshotModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
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

  const snapshots = useMemo(
    () =>
      (allSnapshots || [])
        .filter((snapshot) => getNamespace(snapshot) === projectSelected)
        .sort((a, b) => getName(a)?.localeCompare(getName(b))),
    [allSnapshots, projectSelected],
  );

  return {
    error: allSnapshotsErrors,
    projectsLoaded: allSnapshotsLoaded,
    projectsWithSnapshots,
    snapshots,
    snapshotsLoaded: allSnapshotsLoaded,
  };
};

export default useSnapshots;
