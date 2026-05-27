import { useMemo } from 'react';

import {
  modelToGroupVersionKind,
  NamespaceModel,
  VolumeSnapshotModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { VolumeSnapshotKind } from './types';

type UseSnapshotsReturnType = {
  error: Error;
  namespacesLoaded: boolean;
  namespacesNames: string[];
  snapshots: VolumeSnapshotKind[];
  snapshotsLoaded: boolean;
};

const useSnapshots = (namespaceSelected: string, cluster?: string): UseSnapshotsReturnType => {
  const [namespaces, namespacesLoaded, namespacesErrors] = useK8sWatchData<K8sResourceCommon[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(NamespaceModel),
    isList: true,
    namespaced: false,
  });

  const namespacesNames = useMemo(
    () => namespaces?.map((namespace) => namespace?.metadata?.name)?.sort((a, b) => a?.localeCompare(b)),
    [namespaces],
  );

  const snapshotWathcResource = namespaceSelected
    ? {
        cluster,
        groupVersionKind: modelToGroupVersionKind(VolumeSnapshotModel),
        isList: true,
        namespace: namespaceSelected,
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
    error: namespacesErrors || snapshotsErrors,
    namespacesLoaded,
    namespacesNames,
    snapshots,
    snapshotsLoaded,
  };
};

export default useSnapshots;
