import { useMemo } from 'react';

import {
  modelToGroupVersionKind,
  VolumeSnapshotModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { filterResourcesByAllowedPreferences } from '@kubevirt-utils/resources/bootableresources/preferenceLabelFilter';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

import { type VolumeSnapshotKind } from './types';

type ProjectSnapshotCount = {
  count: number;
  name: string;
};

type UseSnapshotsReturnType = {
  error?: Error;
  projectsLoaded: boolean;
  projectsWithSnapshots: ProjectSnapshotCount[];
  snapshots: VolumeSnapshotKind[];
  snapshotsLoaded: boolean;
};

const useSnapshots = (
  projectSelected: string,
  cluster?: string,
  allowedPreferenceNames?: string[],
): UseSnapshotsReturnType => {
  const [allSnapshots, allSnapshotsLoaded, allSnapshotsErrors] = useK8sWatchData<
    VolumeSnapshotKind[]
  >({
    cluster,
    groupVersionKind: modelToGroupVersionKind(VolumeSnapshotModel),
    isList: true,
    namespace: '',
    namespaced: true,
  });

  const preferenceFilteredSnapshots = useMemo(
    () => filterResourcesByAllowedPreferences(allSnapshots, allowedPreferenceNames),
    [allSnapshots, allowedPreferenceNames],
  );

  const projectsWithSnapshots = useMemo(() => {
    const countByNamespace = preferenceFilteredSnapshots.reduce<Record<string, number>>(
      (acc, snapshot) => {
        const ns = getNamespace(snapshot);
        if (ns) {
          acc[ns] = (acc[ns] ?? 0) + 1;
        }
        return acc;
      },
      {},
    );

    return Object.entries(countByNamespace)
      .map(([name, count]) => ({ count, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [preferenceFilteredSnapshots]);

  const snapshots = useMemo(
    () =>
      preferenceFilteredSnapshots
        .filter((snapshot) => getNamespace(snapshot) === projectSelected)
        .sort((a, b) => (getName(a) ?? '').localeCompare(getName(b) ?? '')),
    [preferenceFilteredSnapshots, projectSelected],
  );

  const loaded = allSnapshotsLoaded || !!allSnapshotsErrors;

  return {
    error: allSnapshotsErrors,
    projectsLoaded: loaded,
    projectsWithSnapshots,
    snapshots,
    snapshotsLoaded: loaded,
  };
};

export default useSnapshots;
