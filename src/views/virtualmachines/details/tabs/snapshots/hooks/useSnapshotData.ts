import * as React from 'react';

import {
  VirtualMachineRestoreModelGroupVersionKind,
  VirtualMachineSnapshotModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console';
import {
  V1alpha1VirtualMachineRestore,
  V1alpha1VirtualMachineSnapshot,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { getVmRestoreSnapshotName, getVmRestoreTime } from '../utils/selectors';

export type UseSnapshotData = {
  error: any;
  loaded: boolean;
  restoresMap: any;
  snapshots: V1alpha1VirtualMachineSnapshot[];
};

const useSnapshotData = (vmName: string, namespace: string): UseSnapshotData => {
  const [snapshots, snapshotsLoaded, snapshotsError] = useK8sWatchResource<
    V1alpha1VirtualMachineSnapshot[]
  >({
    groupVersionKind: VirtualMachineSnapshotModelGroupVersionKind,
    isList: true,
    namespace,
    namespaced: true,
  });

  const [restores, restoresLoaded, restoresError] = useK8sWatchResource<
    V1alpha1VirtualMachineRestore[]
  >({
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
