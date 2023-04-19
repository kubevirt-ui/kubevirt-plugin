import * as React from 'react';
import format from 'date-fns/format';
import { VMStatusConditionLabelList } from 'src/views/virtualmachines/list/components/VMStatusConditionLabel';

import { NodeModel } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ResourceLink, RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';
import { GlobeAmericasIcon } from '@patternfly/react-icons';

import VirtualMachinesInsanceActions from '../actions/VirtualMachinesInstanceActions';
import VirtualMachinesInstancesIP from '../components/VirtualMachinesInstanceIP';
import VirtualMachinesInstancesStatus from '../components/VirtualMachinesInstancesStatus';

type VirtualMachinesInstancesRowProps = RowProps<V1VirtualMachineInstance, { kind: string }>;

const VirtualMachinesInstancesRow: React.FC<VirtualMachinesInstancesRowProps> = ({
  obj,
  activeColumnIDs,
  rowData: { kind },
}) => {
  return (
    <>
      <TableData id="name" activeColumnIDs={activeColumnIDs}>
        <ResourceLink kind={kind} name={obj.metadata.name} namespace={obj.metadata.namespace} />
      </TableData>
      <TableData id="namespace" activeColumnIDs={activeColumnIDs}>
        <ResourceLink kind="Namespace" name={obj.metadata.namespace} />
      </TableData>
      <TableData id="status" activeColumnIDs={activeColumnIDs}>
        <VirtualMachinesInstancesStatus status={obj?.status?.phase} />
      </TableData>
      <TableData id="conditions" activeColumnIDs={activeColumnIDs}>
        <VMStatusConditionLabelList conditions={obj?.status?.conditions?.filter((c) => c.reason)} />
      </TableData>
      <TableData id="created" activeColumnIDs={activeColumnIDs}>
        <GlobeAmericasIcon />{' '}
        {format(new Date(obj?.metadata?.creationTimestamp), 'MMM dd, yyyy, h:mm a')}
      </TableData>
      <TableData id="node" activeColumnIDs={activeColumnIDs}>
        <ResourceLink kind={NodeModel.kind} name={obj.status.nodeName} />
      </TableData>
      <TableData id="ipAddress" activeColumnIDs={activeColumnIDs}>
        <VirtualMachinesInstancesIP vmi={obj} />
      </TableData>
      <TableData id="" activeColumnIDs={activeColumnIDs} className="pf-c-table__action">
        <VirtualMachinesInsanceActions vmi={obj} />
      </TableData>
    </>
  );
};

export default VirtualMachinesInstancesRow;
