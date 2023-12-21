import * as React from 'react';

import { VirtualMachineSnapshotModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import {
  V1alpha1VirtualMachineRestore,
  V1alpha1VirtualMachineSnapshot,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
import { ResourceLink, RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';

import { snapshotStatuses } from '../../utils/consts';
import IndicationLabelList from '../IndicationLabel/IndicationLabelList';
import SnapshotStatusIcon from '../SnapshotStatusIcon/SnapshotStatusIcon';

import SnapshotActionsMenu from './SnapshotActionsMenu';

const SnapshotRow: React.FC<
  RowProps<
    V1alpha1VirtualMachineSnapshot,
    { isVMRunning: boolean; restores: Map<string, V1alpha1VirtualMachineRestore> }
  >
> = ({ activeColumnIDs, obj: snapshot, rowData: { isVMRunning, restores } }) => {
  const relevantRestore: V1alpha1VirtualMachineRestore = restores?.[snapshot?.metadata?.name];
  const isRestoreDisabled = isVMRunning || snapshot?.status?.phase !== snapshotStatuses.Succeeded;
  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} id="name">
        <ResourceLink
          groupVersionKind={VirtualMachineSnapshotModelGroupVersionKind}
          name={snapshot?.metadata?.name}
          namespace={snapshot?.metadata?.namespace}
        />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="created">
        <Timestamp timestamp={snapshot?.metadata?.creationTimestamp} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="status">
        <SnapshotStatusIcon phase={snapshot?.status?.phase} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="last-restored">
        <Timestamp timestamp={relevantRestore?.status?.restoreTime} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="indications">
        <IndicationLabelList snapshot={snapshot} />
      </TableData>
      <TableData
        activeColumnIDs={activeColumnIDs}
        className="dropdown-kebab-pf pf-v5-c-table__action"
        id=""
      >
        <SnapshotActionsMenu isRestoreDisabled={isRestoreDisabled} snapshot={snapshot} />
      </TableData>
    </>
  );
};

export default SnapshotRow;
