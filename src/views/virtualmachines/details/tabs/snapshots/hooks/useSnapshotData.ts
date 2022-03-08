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

type UseSnapshotData = (namespace: string) => {
  snapshots: V1alpha1VirtualMachineSnapshot[];
  restoresMap: any;
  loaded: boolean;
  error: any;
};

const useSnapshotData: UseSnapshotData = (namespace) => {
  const [snapshots, snapshotsLoaded, snapshotsError] = useK8sWatchResource<
    V1alpha1VirtualMachineSnapshot[]
  >({
    isList: true,
    groupVersionKind: VirtualMachineSnapshotModelGroupVersionKind,
    namespaced: true,
    namespace: namespace,
  });

  const [restores, restoresLoaded, restoresError] = useK8sWatchResource<
    V1alpha1VirtualMachineRestore[]
  >({
    isList: true,
    groupVersionKind: VirtualMachineRestoreModelGroupVersionKind,
    namespaced: true,
    namespace: namespace,
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

  return { snapshots, restoresMap, loaded, error };
};

export default useSnapshotData;
