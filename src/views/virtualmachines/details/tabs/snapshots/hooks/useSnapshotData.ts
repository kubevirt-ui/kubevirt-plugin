import * as React from 'react';

import {
  VirtualMachineRestoreModelGroupVersionKind,
  VirtualMachineSnapshotModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console';
import {
  V1beta1VirtualMachineRestore,
  V1beta1VirtualMachineSnapshot,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useFleetK8sWatchResource } from '@stolostron/multicluster-sdk';

import { getVmRestoreSnapshotName, getVmRestoreTime } from '../utils/selectors';

export type UseSnapshotData = {
  error: any;
  loaded: boolean;
  restoresMap: any;
  snapshots: V1beta1VirtualMachineSnapshot[];
};

const useSnapshotData = (vmName: string, namespace: string, cluster?: string): UseSnapshotData => {
  const [snapshots, snapshotsLoaded, snapshotsError] = useFleetK8sWatchResource<
    V1beta1VirtualMachineSnapshot[]
  >({
    cluster,
    groupVersionKind: VirtualMachineSnapshotModelGroupVersionKind,
    isList: true,
    namespace,
    namespaced: true,
  });

  const [restores, restoresLoaded, restoresError] = useFleetK8sWatchResource<
    V1beta1VirtualMachineRestore[]
  >({
    cluster,
    groupVersionKind: VirtualMachineRestoreModelGroupVersionKind,
    isList: true,
    namespace,
    namespaced: true,
  });

  const loaded = React.useMemo(
    () => snapshotsLoaded && restoresLoaded,
    [snapshotsLoaded, restoresLoaded],
  );

  const error = React.useMemo(
    () => snapshotsError || restoresError,
    [snapshotsError, restoresError],
  );

  const restoresMap = React.useMemo(() => {
    // we map each snapshot to its restores array
    const tempMap = restores?.reduce((restoreMap, currentRestore) => {
      const relevantRestore = restoreMap[getVmRestoreSnapshotName(currentRestore)];
      if (
        !relevantRestore ||
        new Date(getVmRestoreTime(relevantRestore)).getTime() <
          new Date(getVmRestoreTime(currentRestore)).getTime()
      ) {
        restoreMap[getVmRestoreSnapshotName(currentRestore)] = currentRestore;
      }
      return restoreMap;
    }, {});
    return tempMap;
  }, [restores]);

  return {
    error,
    loaded,
    restoresMap,
    snapshots: snapshots?.filter((snapshot) => snapshot?.spec?.source?.name === vmName),
  };
};

export default useSnapshotData;
