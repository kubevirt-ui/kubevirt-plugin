import * as React from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ResourceLink, RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';

import Timestamp from '../Timestamp/Timestamp';
import VirtualMachineActions from '../VirtualMachineActions/VirtualMachineActions';
import VirtualMachineStatus from '../VirtualMachineStatus/VirtualMachineStatus';
import { VMStatusConditionLabelList } from '../VMStatusConditionLabel';

const VirtualMachineRowLayout: React.FC<
  RowProps<
    V1VirtualMachine,
    { kind: string; node: React.ReactNode | string; ips: React.ReactNode | string }
  >
> = ({ obj, activeColumnIDs, rowData: { kind, node, ips } }) => {
  return (
    <>
      <TableData id="name" activeColumnIDs={activeColumnIDs}>
        <ResourceLink kind={kind} name={obj.metadata.name} namespace={obj.metadata.namespace} />
      </TableData>
      <TableData id="namespace" activeColumnIDs={activeColumnIDs}>
        <ResourceLink kind="Namespace" name={obj.metadata.namespace} />
      </TableData>
      <TableData id="status" activeColumnIDs={activeColumnIDs}>
        <VirtualMachineStatus printableStatus={obj?.status?.printableStatus} />
      </TableData>
      <TableData id="conditions" activeColumnIDs={activeColumnIDs}>
        <VMStatusConditionLabelList conditions={obj?.status?.conditions?.filter((c) => c.reason)} />
      </TableData>
      <TableData id="node" activeColumnIDs={activeColumnIDs}>
        {node}
      </TableData>
      <TableData id="created" activeColumnIDs={activeColumnIDs}>
        <Timestamp timestamp={obj?.metadata?.creationTimestamp} />
      </TableData>
      <TableData id="ip-address" activeColumnIDs={activeColumnIDs}>
        {ips}
      </TableData>
      <TableData
        id="actions"
        activeColumnIDs={activeColumnIDs}
        className="dropdown-kebab-pf pf-c-table__action"
      >
        <VirtualMachineActions />
      </TableData>
    </>
  );
};

export default VirtualMachineRowLayout;
