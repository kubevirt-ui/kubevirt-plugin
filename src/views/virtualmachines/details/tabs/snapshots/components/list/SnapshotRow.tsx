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
    { restores: Map<string, V1alpha1VirtualMachineRestore>; isVMRunning: boolean }
  >
> = ({ obj: snapshot, activeColumnIDs, rowData: { restores, isVMRunning } }) => {
  const relevantRestore: V1alpha1VirtualMachineRestore = restores?.[snapshot?.metadata?.name];
  const isRestoreDisabled = isVMRunning || snapshot?.status?.phase !== snapshotStatuses.Succeeded;
  return (
    <>
      <TableData id="name" activeColumnIDs={activeColumnIDs}>
        <ResourceLink
          groupVersionKind={VirtualMachineSnapshotModelGroupVersionKind}
          name={snapshot?.metadata?.name}
          namespace={snapshot?.metadata?.namespace}
        />
      </TableData>
      <TableData id="created" activeColumnIDs={activeColumnIDs}>
        <Timestamp timestamp={snapshot?.metadata?.creationTimestamp} />
      </TableData>
      <TableData id="status" activeColumnIDs={activeColumnIDs}>
        <SnapshotStatusIcon phase={snapshot?.status?.phase} />
      </TableData>
      <TableData id="last-restored" activeColumnIDs={activeColumnIDs}>
        <Timestamp timestamp={relevantRestore?.status?.restoreTime} />
      </TableData>
      <TableData id="indications" activeColumnIDs={activeColumnIDs}>
        <IndicationLabelList snapshot={snapshot} />
      </TableData>
      <TableData
        id=""
        activeColumnIDs={activeColumnIDs}
        className="dropdown-kebab-pf pf-c-table__action"
      >
        <SnapshotActionsMenu snapshot={snapshot} isRestoreDisabled={isRestoreDisabled} />
      </TableData>
    </>
  );
};

export default SnapshotRow;
