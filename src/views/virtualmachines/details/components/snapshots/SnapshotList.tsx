import * as React from 'react';

import {
  V1alpha1VirtualMachineRestore,
  V1alpha1VirtualMachineSnapshot,
  V1VirtualMachine,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  VirtualMachineRestoreModelGroupVersionKind,
  VirtualMachineSnapshotModelGroupVersionKind,
} from '@kubevirt-utils/models';
import { useK8sWatchResource, VirtualizedTable } from '@openshift-console/dynamic-plugin-sdk';

import useSnapshotColumns from './hooks/useSnapshotColumns';
import SnapshotRow from './SnapshotRow';

type NetworkInterfaceTableProps = {
  vm?: V1VirtualMachine;
};

const NetworkInterfaceList: React.FC<NetworkInterfaceTableProps> = ({ vm }) => {
  const columns = useSnapshotColumns();
  const [snapshots, snapshotsLoaded, snapshotsError] = useK8sWatchResource<
    V1alpha1VirtualMachineSnapshot[]
  >({
    isList: true,
    groupVersionKind: VirtualMachineSnapshotModelGroupVersionKind,
    namespaced: true,
    namespace: vm?.metadata?.namespace,
  });

  const [restores] = useK8sWatchResource<V1alpha1VirtualMachineRestore[]>({
    isList: true,
    groupVersionKind: VirtualMachineRestoreModelGroupVersionKind,
    namespaced: true,
    namespace: vm?.metadata?.namespace,
  });
  return (
    <VirtualizedTable
      data={snapshots}
      unfilteredData={snapshots}
      loaded={snapshotsLoaded}
      loadError={snapshotsError}
      columns={columns}
      Row={SnapshotRow}
      rowData={{ restores }}
    />
  );
};

export default NetworkInterfaceList;
