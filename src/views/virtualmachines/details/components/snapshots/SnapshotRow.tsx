import * as React from 'react';

import {
  V1alpha1VirtualMachineRestore,
  V1alpha1VirtualMachineSnapshot,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';

import IndicationLabelList from './components/IndicationLabel/IndicationLabelList';
import { useSnapshotStatus } from './hooks/useSnapshotStatus';
import Timestamp from '../../../list/components/Timestamp/Timestamp';

const SnapshotRow: React.FC<
  RowProps<V1alpha1VirtualMachineSnapshot, { restores: V1alpha1VirtualMachineRestore[] }>
> = ({ obj: snapshot, activeColumnIDs, rowData: { restores } }) => {
  const relevantRestore = restores?.find(
    (restore) => restore?.spec?.virtualMachineSnapshotName === snapshot?.metadata?.name,
  );
  const status = useSnapshotStatus(snapshot, relevantRestore);
  return (
    <>
      <TableData id="name" activeColumnIDs={activeColumnIDs}>
        {snapshot?.metadata?.name}
      </TableData>
      <TableData id="created" activeColumnIDs={activeColumnIDs}>
        <Timestamp timestamp={snapshot?.metadata?.creationTimestamp} />
      </TableData>
      <TableData id="status" activeColumnIDs={activeColumnIDs}>
        {status}
      </TableData>
      <TableData id="last-restored" activeColumnIDs={activeColumnIDs}>
        <Timestamp timestamp={relevantRestore?.status?.restoreTime} />
      </TableData>
      <TableData id="indications" activeColumnIDs={activeColumnIDs}>
        <IndicationLabelList snapshot={snapshot} />
      </TableData>
      <TableData
        id="actions"
        activeColumnIDs={activeColumnIDs}
        className="dropdown-kebab-pf pf-c-table__action"
      >
        {/* TODO */}
      </TableData>
    </>
  );
};

export default SnapshotRow;
