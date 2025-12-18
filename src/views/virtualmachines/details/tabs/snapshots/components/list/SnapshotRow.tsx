import * as React from 'react';

import { VirtualMachineSnapshotModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  V1beta1VirtualMachineRestore,
  V1beta1VirtualMachineSnapshot,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';
import { RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';

import { snapshotStatuses } from '../../utils/consts';
import IndicationLabelList from '../IndicationLabel/IndicationLabelList';
import SnapshotStatusIcon from '../SnapshotStatusIcon/SnapshotStatusIcon';

import SnapshotActionsMenu from './SnapshotActionsMenu';

const SnapshotRow: React.FC<
  RowProps<
    V1beta1VirtualMachineSnapshot,
    { isVMRunning: boolean; restores: Map<string, V1beta1VirtualMachineRestore> }
  >
> = ({ activeColumnIDs, obj: snapshot, rowData: { isVMRunning, restores } }) => {
  const relevantRestore: V1beta1VirtualMachineRestore = restores?.[snapshot?.metadata?.name];
  const isRestoreDisabled = isVMRunning || snapshot?.status?.phase !== snapshotStatuses.Succeeded;
  const isCloneDisabled = !snapshot?.status?.readyToUse;
  const displayPhase = snapshot?.status?.phase;
  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} id="name">
        <MulticlusterResourceLink
          cluster={getCluster(snapshot)}
          groupVersionKind={VirtualMachineSnapshotModelGroupVersionKind}
          name={snapshot?.metadata?.name}
          namespace={snapshot?.metadata?.namespace}
        />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="created">
        <Timestamp timestamp={snapshot?.metadata?.creationTimestamp} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="status">
        <SnapshotStatusIcon phase={displayPhase} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="last-restored">
        <Timestamp timestamp={relevantRestore?.status?.restoreTime} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="indications">
        <IndicationLabelList snapshot={snapshot} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-v6-c-table__action" id="">
        <SnapshotActionsMenu
          isCloneDisabled={isCloneDisabled}
          isRestoreDisabled={isRestoreDisabled}
          snapshot={snapshot}
        />
      </TableData>
    </>
  );
};

export default SnapshotRow;
