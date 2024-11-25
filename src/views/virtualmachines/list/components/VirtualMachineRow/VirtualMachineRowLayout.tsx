import * as React from 'react';

import { VirtualMachineModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import {
  V1VirtualMachine,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { ResourceLink, RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';
import { Checkbox } from '@patternfly/react-core';
import VirtualMachineActions from '@virtualmachines/actions/components/VirtualMachineActions/VirtualMachineActions';
import useVirtualMachineActionsProvider from '@virtualmachines/actions/hooks/useVirtualMachineActionsProvider';
import { deselectVM, isVMSelected, selectVM } from '@virtualmachines/list/selectedVMs';
import { setSelectedTreeItem, treeDataMap } from '@virtualmachines/tree/utils/utils';

import VirtualMachineStatus from '../VirtualMachineStatus/VirtualMachineStatus';
import { VMStatusConditionLabelList } from '../VMStatusConditionLabel';

import './virtual-machine-row-layout.scss';

const VirtualMachineRowLayout: React.FC<
  RowProps<
    V1VirtualMachine,
    {
      ips: React.ReactNode | string;
      isSingleNodeCluster: boolean;
      node: React.ReactNode | string;
      vmim: V1VirtualMachineInstanceMigration;
    }
  >
> = ({ activeColumnIDs, obj, rowData: { ips, isSingleNodeCluster, node, vmim } }) => {
  const selected = isVMSelected(obj);

  const [actions] = useVirtualMachineActionsProvider(obj, vmim, isSingleNodeCluster);
  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} className="selection-column vm-column" id="">
        <Checkbox
          id={`select-${obj?.metadata?.uid}`}
          isChecked={selected}
          onChange={() => (selected ? deselectVM(obj) : selectVM(obj))}
        />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="vm-column" id="name">
        <ResourceLink
          onClick={() => {
            setSelectedTreeItem(treeDataMap.value[`${getNamespace(obj)}/${getName(obj)}`]);
          }}
          groupVersionKind={VirtualMachineModelGroupVersionKind}
          name={getName(obj)}
          namespace={getNamespace(obj)}
        />
      </TableData>
      <TableData
        activeColumnIDs={activeColumnIDs}
        className="pf-m-width-10 vm-column"
        id="namespace"
      >
        <ResourceLink kind="Namespace" name={getNamespace(obj)} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-15 vm-column" id="status">
        <VirtualMachineStatus vm={obj} />
      </TableData>
      <TableData
        activeColumnIDs={activeColumnIDs}
        className="pf-m-width-20 vm-column"
        id="conditions"
      >
        <VMStatusConditionLabelList conditions={obj?.status?.conditions?.filter((c) => c.reason)} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="vm-column" id="node">
        {node}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="vm-column" id="created">
        <Timestamp timestamp={obj?.metadata?.creationTimestamp} />
      </TableData>
      <TableData
        activeColumnIDs={activeColumnIDs}
        className="pf-m-width-10 vm-column"
        id="ip-address"
      >
        {ips}
      </TableData>
      <TableData
        activeColumnIDs={activeColumnIDs}
        className="dropdown-kebab-pf pf-v5-c-table__action"
        id=""
      >
        <VirtualMachineActions actions={actions} isKebabToggle />
      </TableData>
    </>
  );
};

export default VirtualMachineRowLayout;
