import { useMemo } from 'react';

import { VirtualMachineRestoreModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineSnapshotModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  V1beta1VirtualMachineRestore,
  V1beta1VirtualMachineSnapshot,
  V1VirtualMachine,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { useFleetK8sWatchResource } from '@stolostron/multicluster-sdk';

import { getVmRestoreSnapshotName, getVmRestoreTime } from '../utils/selectors';

export type UseSnapshotData = {
  error: any;
  loaded: boolean;
  restoresMap: any;
  snapshots: V1beta1VirtualMachineSnapshot[];
};

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

  const loaded = useMemo(
    () => snapshotsLoaded && restoresLoaded,
    [snapshotsLoaded, restoresLoaded],
  );

  const error = useMemo(() => snapshotsError || restoresError, [snapshotsError, restoresError]);

  const restoresMap = useMemo(() => {
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
