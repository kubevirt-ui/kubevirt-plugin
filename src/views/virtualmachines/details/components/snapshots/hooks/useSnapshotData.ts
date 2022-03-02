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

type UseSnapshotData = (
  namespace: string,
) => [V1alpha1VirtualMachineSnapshot[], Map<string, V1alpha1VirtualMachineRestore>, boolean, any];

const useSnapshotData: UseSnapshotData = (namespace) => {
  const [snapshots, snapshotsLoaded, snapshotsError] = useK8sWatchResource<
    V1alpha1VirtualMachineSnapshot[]
  >({
    isList: true,
    groupVersionKind: VirtualMachineSnapshotModelGroupVersionKind,
    namespaced: true,
    namespace: namespace,
  });

  const [restores] = useK8sWatchResource<V1alpha1VirtualMachineRestore[]>({
    isList: true,
    groupVersionKind: VirtualMachineRestoreModelGroupVersionKind,
    namespaced: true,
    namespace: namespace,
  });

  const restoresMap = React.useMemo(() => {
    // we map each snapshot to its restores array
    const map = new Map<string, V1alpha1VirtualMachineRestore>();
    restores?.forEach((restore) => {
      map.set(restore?.spec?.virtualMachineSnapshotName, restore);
    });
    return map;
  }, [restores]);

  return [snapshots, restoresMap, snapshotsLoaded, snapshotsError];
};

export default useSnapshotData;
