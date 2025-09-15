import { useMemo } from 'react';

import {
  modelToGroupVersionKind,
  ProjectModel,
  VolumeSnapshotModel,
} from '@kubevirt-ui/kubevirt-api/console';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { VolumeSnapshotKind } from './types';

type UseSnapshotsReturnType = {
  error: Error;
  projectsLoaded: boolean;
  projectsNames: string[];
  snapshots: VolumeSnapshotKind[];
  snapshotsLoaded: boolean;
};

const useSnapshots = (projectSelected: string, cluster?: string): UseSnapshotsReturnType => {
  const [projects, projectsLoaded, projectsErrors] = useK8sWatchData<K8sResourceCommon[]>({
    cluster,
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
        cluster,
        groupVersionKind: modelToGroupVersionKind(VolumeSnapshotModel),
        isList: true,
        namespace: projectSelected,
        namespaced: true,
      }
    : null;

  const [snapshotsRaw, snapshotsLoaded, snapshotsErrors] =
    useK8sWatchData<VolumeSnapshotKind[]>(snapshotWathcResource);

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
