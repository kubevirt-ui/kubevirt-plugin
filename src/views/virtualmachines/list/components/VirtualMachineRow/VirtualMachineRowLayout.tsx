import React, { FC, ReactNode, useMemo } from 'react';

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
import { getDeletionProtectionPrintableStatus } from '@virtualmachines/details/tabs/configuration/details/components/DeletionProtection/utils/utils';
import { deselectVM, isVMSelected, selectVM } from '@virtualmachines/list/selectedVMs';

import { VMStatusConditionLabelList } from '../VMStatusConditionLabel';

import CPUPercentage from './components/CPUPercentage';
import MemoryPercentage from './components/MemoryPercentage';
import NetworkUsage from './components/NetworkUsage';

import './virtual-machine-row-layout.scss';

const VirtualMachineRowLayout: FC<
  RowProps<
    V1VirtualMachine,
    {
      ips: ReactNode | string;
      isSingleNodeCluster: boolean;
      node: ReactNode | string;
      status: ReactNode;
      vmim: V1VirtualMachineInstanceMigration;
      vmiMemory?: string;
    }
  >
> = ({
  activeColumnIDs,
  obj,
  rowData: { ips, isSingleNodeCluster, node, status, vmim, vmiMemory },
}) => {
  const selected = isVMSelected(obj);

  const vmName = useMemo(() => getName(obj), [obj]);
  const vmNamespace = useMemo(() => getNamespace(obj), [obj]);
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
      <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-20 vm-column" id="name">
        <ResourceLink
          groupVersionKind={VirtualMachineModelGroupVersionKind}
          name={vmName}
          namespace={vmNamespace}
        />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="vm-column" id="namespace">
        <ResourceLink kind="Namespace" name={vmNamespace} truncate />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="vm-column" id="status">
        {status}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="vm-column" id="conditions">
        <VMStatusConditionLabelList conditions={obj?.status?.conditions?.filter((c) => c.reason)} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="vm-column" id="node">
        {node}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="vm-column" id="created">
        <Timestamp timestamp={obj?.metadata?.creationTimestamp} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="vm-column" id="ip-address">
        {ips}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="vm-column" id="memory-usage">
        <MemoryPercentage vmiMemory={vmiMemory} vmName={vmName} vmNamespace={vmNamespace} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="vm-column" id="cpu-usage">
        <CPUPercentage vmName={vmName} vmNamespace={vmNamespace} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="vm-column" id="network-usage">
        <NetworkUsage vmName={vmName} vmNamespace={vmNamespace} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="vm-column" id="deletion-protection">
        {getDeletionProtectionPrintableStatus(obj)}
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
