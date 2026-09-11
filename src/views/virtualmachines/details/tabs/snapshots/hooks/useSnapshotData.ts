import { useMemo } from 'react';

import { VirtualMachineRestoreModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineSnapshotModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  type V1beta1VirtualMachineRestore,
  type V1beta1VirtualMachineSnapshot,
  type V1VirtualMachine,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { useFleetK8sWatchResource } from '@stolostron/multicluster-sdk';

import { buildRestoresMap } from '../utils/restoresMap';

export type UseSnapshotData = {
  error: unknown;
  loaded: boolean;
  restoresMap: Record<string, V1beta1VirtualMachineRestore>;
  snapshots: V1beta1VirtualMachineSnapshot[];
};

type WatchResult<T> = [T | undefined, boolean, unknown];

const useSnapshotData = (vm: V1VirtualMachine): UseSnapshotData => {
  const cluster = getCluster(vm);
  const namespace = getNamespace(vm);
  const vmName = getName(vm);

  const [snapshots, snapshotsLoaded, snapshotsError] = useFleetK8sWatchResource<
    V1beta1VirtualMachineSnapshot[]
  >({
    cluster,
    groupVersionKind: {
      group: VirtualMachineSnapshotModel.apiGroup,
      kind: VirtualMachineSnapshotModel.kind,
      version: 'v1alpha1',
    },
    isList: true,
    namespace,
    namespaced: true,
  }) as WatchResult<V1beta1VirtualMachineSnapshot[]>;

  const [restores, restoresLoaded, restoresError] = useFleetK8sWatchResource<
    V1beta1VirtualMachineRestore[]
  >({
    cluster,
    groupVersionKind: VirtualMachineRestoreModelGroupVersionKind,
    isList: true,
    namespace,
    namespaced: true,
  }) as WatchResult<V1beta1VirtualMachineRestore[]>;

  const loaded = useMemo(
    () => snapshotsLoaded && restoresLoaded,
    [snapshotsLoaded, restoresLoaded],
  );

  const error = useMemo(() => snapshotsError ?? restoresError, [snapshotsError, restoresError]);

  const restoresMap = useMemo(
    (): Record<string, V1beta1VirtualMachineRestore> => buildRestoresMap(restores),
    [restores],
  );

  return {
    error,
    loaded,
    restoresMap,
    snapshots: (snapshots ?? []).filter((snapshot) => snapshot?.spec?.source?.name === vmName),
  };
};

export default useSnapshotData;
