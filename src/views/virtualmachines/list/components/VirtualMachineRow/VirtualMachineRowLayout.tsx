import * as React from 'react';
import { getBooleanText } from 'src/views/migrationpolicies/utils/utils';

import {
  V1VirtualMachine,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
import { ResourceLink, RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';
import VirtualMachineActions from '@virtualmachines/actions/components/VirtualMachineActions/VirtualMachineActions';
import { isLiveMigratable } from '@virtualmachines/utils';

import VirtualMachineStatus from '../VirtualMachineStatus/VirtualMachineStatus';
import { VMStatusConditionLabelList } from '../VMStatusConditionLabel';

import './virtual-machine-row-layout.scss';

const VirtualMachineRowLayout: React.FC<
  RowProps<
    V1VirtualMachine,
    {
      kind: string;
      node: React.ReactNode | string;
      ips: React.ReactNode | string;
      vmim: V1VirtualMachineInstanceMigration;
      isSingleNodeCluster: boolean;
    }
  >
> = ({ obj, activeColumnIDs, rowData: { kind, node, ips, vmim, isSingleNodeCluster } }) => {
  return (
    <>
      <TableData id="name" activeColumnIDs={activeColumnIDs} className="pf-m-width-15 vm-column">
        <ResourceLink kind={kind} name={obj.metadata.name} namespace={obj.metadata.namespace} />
      </TableData>
      <TableData
        id="namespace"
        activeColumnIDs={activeColumnIDs}
        className="pf-m-width-10 vm-column"
      >
        <ResourceLink kind="Namespace" name={obj.metadata.namespace} />
      </TableData>
      <TableData id="status" activeColumnIDs={activeColumnIDs} className="pf-m-width-10 vm-column">
        <VirtualMachineStatus printableStatus={obj?.status?.printableStatus} />
      </TableData>
      <TableData
        id="conditions"
        activeColumnIDs={activeColumnIDs}
        className="pf-m-width-20 vm-column"
      >
        <VMStatusConditionLabelList conditions={obj?.status?.conditions?.filter((c) => c.reason)} />
      </TableData>
      <TableData
        id="live-migratable"
        activeColumnIDs={activeColumnIDs}
        className="pf-m-width-10 vm-column"
      >
        {getBooleanText(isLiveMigratable(obj, isSingleNodeCluster))}
      </TableData>
      <TableData id="node" activeColumnIDs={activeColumnIDs} className="pf-m-width-15 vm-column">
        {node}
      </TableData>
      <TableData id="created" activeColumnIDs={activeColumnIDs} className="pf-m-width-15 vm-column">
        <Timestamp timestamp={obj?.metadata?.creationTimestamp} />
      </TableData>
      <TableData
        id="ip-address"
        activeColumnIDs={activeColumnIDs}
        className="pf-m-width-10 vm-column"
      >
        {ips}
      </TableData>
      <TableData
        id=""
        activeColumnIDs={activeColumnIDs}
        className="dropdown-kebab-pf pf-c-table__action"
      >
        <VirtualMachineActions
          vm={obj}
          isKebabToggle
          vmim={vmim}
          isSingleNodeCluster={isSingleNodeCluster}
        />
      </TableData>
    </>
  );
};

export default VirtualMachineRowLayout;
