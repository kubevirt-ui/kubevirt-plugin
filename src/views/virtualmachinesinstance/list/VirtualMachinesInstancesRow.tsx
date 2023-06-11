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
  activeColumnIDs,
  obj,
  rowData: { kind },
}) => {
  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} id="name">
        <ResourceLink kind={kind} name={obj.metadata.name} namespace={obj.metadata.namespace} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="namespace">
        <ResourceLink kind="Namespace" name={obj.metadata.namespace} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="status">
        <VirtualMachinesInstancesStatus status={obj?.status?.phase} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="conditions">
        <VMStatusConditionLabelList conditions={obj?.status?.conditions?.filter((c) => c.reason)} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="created">
        <GlobeAmericasIcon />{' '}
        {format(new Date(obj?.metadata?.creationTimestamp), 'MMM dd, yyyy, h:mm a')}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="node">
        <ResourceLink kind={NodeModel.kind} name={obj.status.nodeName} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="ipAddress">
        <VirtualMachinesInstancesIP vmi={obj} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-c-table__action" id="">
        <VirtualMachinesInsanceActions vmi={obj} />
      </TableData>
    </>
  );
};

export default VirtualMachinesInstancesRow;
