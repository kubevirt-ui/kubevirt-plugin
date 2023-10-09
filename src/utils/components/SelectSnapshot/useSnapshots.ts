import { useMemo } from 'react';

import {
  modelToGroupVersionKind,
  ProjectModel,
  VolumeSnapshotModel,
} from '@kubevirt-ui/kubevirt-api/console';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { VolumeSnapshotKind } from './types';

type UseSnapshotsReturnType = {
  error: Error;
  projectsLoaded: boolean;
  projectsNames: string[];
  snapshots: VolumeSnapshotKind[];
  snapshotsLoaded: boolean;
};

const useSnapshots = (projectSelected: string): UseSnapshotsReturnType => {
  const [projects, projectsLoaded, projectsErrors] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: modelToGroupVersionKind(ProjectModel),
    isList: true,
    namespaced: false,
  });

  const projectsNames = useMemo(
    () => projects?.map((project) => project?.metadata?.name)?.sort((a, b) => a?.localeCompare(b)),
    [projects],
  );

  const snapshotWathcResource = projectSelected
    ? {
        groupVersionKind: modelToGroupVersionKind(VolumeSnapshotModel),
        isList: true,
        namespace: projectSelected,
        namespaced: true,
      }
    : null;

  const [snapshotsRaw, snapshotsLoaded, snapshotsErrors] =
    useK8sWatchResource<VolumeSnapshotKind[]>(snapshotWathcResource);

  const snapshots = useMemo(
    () => (snapshotsRaw || [])?.sort((a, b) => a?.metadata?.name?.localeCompare(b?.metadata?.name)),
    [snapshotsRaw],
  );

  return {
    error: projectsErrors || snapshotsErrors,
    projectsLoaded,
    projectsNames,
    snapshots,
    snapshotsLoaded,
  };
};

export default useSnapshots;
