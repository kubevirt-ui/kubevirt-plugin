import React, { FC, ReactNode, useMemo } from 'react';

import {
  modelToGroupVersionKind,
  StorageClassModel,
  VirtualMachineModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console';
import {
  V1VirtualMachine,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ResourceLink, RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';
import { Checkbox } from '@patternfly/react-core';
import { FleetResourceLink } from '@stolostron/multicluster-sdk';
import VirtualMachineActions from '@virtualmachines/actions/components/VirtualMachineActions/VirtualMachineActions';
import useVirtualMachineActionsProvider from '@virtualmachines/actions/hooks/useVirtualMachineActionsProvider';
import { getDeletionProtectionPrintableStatus } from '@virtualmachines/details/tabs/configuration/details/components/DeletionProtection/utils/utils';
import { filterConditions } from '@virtualmachines/list/components/VirtualMachineRow/utils/utils';
import { deselectVM, isVMSelected, selectVM } from '@virtualmachines/list/selectedVMs';
import { getVirtualMachineStorageClasses, PVCMapper } from '@virtualmachines/utils/mappers';

import { VMStatusConditionLabelList } from '../VMStatusConditionLabel';

import CPUPercentage from './components/CPUPercentage';
import MemoryPercentage from './components/MemoryPercentage';
import NetworkUsage from './components/NetworkUsage';
import useACMTableData from './hooks/useACMTableData';

import './virtual-machine-row-layout.scss';

const VirtualMachineRowLayout: FC<
  RowProps<
    V1VirtualMachine,
    {
      ips: ReactNode | string;
      node: ReactNode | string;
      pvcMapper: PVCMapper;
      status: ReactNode;
      vmim: V1VirtualMachineInstanceMigration;
      vmiMemory?: string;
    }
  >
> = ({
  activeColumnIDs,
  index,
  obj,
  rowData: { ips, node, pvcMapper, status, vmim, vmiMemory },
}) => {
  // TODO: investigate using the index prop
  index;
  const selected = isVMSelected(obj);

  const vmName = useMemo(() => getName(obj), [obj]);
  const vmNamespace = useMemo(() => getNamespace(obj), [obj]);

  const storageClasses = useMemo(
    () => getVirtualMachineStorageClasses(obj, pvcMapper),
    [obj, pvcMapper],
  );

  const [actions] = useVirtualMachineActionsProvider(obj, vmim);

  const [acmTableData] = useACMTableData(obj, activeColumnIDs);
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
        <FleetResourceLink
          cluster={obj?.cluster}
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
        <VMStatusConditionLabelList conditions={filterConditions(obj?.status?.conditions)} />
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
        <MemoryPercentage vm={obj} vmiMemory={vmiMemory} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="vm-column" id="cpu-usage">
        <CPUPercentage vm={obj} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="vm-column" id="network-usage">
        <NetworkUsage vm={obj} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="vm-column" id="deletion-protection">
        {getDeletionProtectionPrintableStatus(obj)}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="vm-column" id="storageclassname">
        {isEmpty(storageClasses)
          ? NO_DATA_DASH
          : storageClasses.map((storageClass) => (
              <ResourceLink
                groupVersionKind={modelToGroupVersionKind(StorageClassModel)}
                key={storageClass}
                name={storageClass}
              />
            ))}
      </TableData>
      {acmTableData}
      <TableData activeColumnIDs={activeColumnIDs} className="pf-v6-c-table__action" id="">
        <VirtualMachineActions actions={actions} isKebabToggle />
      </TableData>
    </>
  );
};

export default VirtualMachineRowLayout;
