import React, { FC, ReactNode, useMemo } from 'react';

import {
  modelToGroupVersionKind,
  NamespaceModel,
  StorageClassModel,
  VirtualMachineModelGroupVersionKind,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getUtilizationQueries } from '@kubevirt-utils/components/Charts/utils/queries';
import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getMemory } from '@kubevirt-utils/resources/vm';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import ACMExtentionsTableData from '@multicluster/components/ACMExtentionsTableData';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { ManagedClusterModel } from '@multicluster/constants';
import { getCluster } from '@multicluster/helpers/selectors';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';
import { Checkbox } from '@patternfly/react-core';
import VirtualMachineActions from '@virtualmachines/actions/components/VirtualMachineActions/VirtualMachineActions';
import useVirtualMachineActionsProvider from '@virtualmachines/actions/hooks/useVirtualMachineActionsProvider';
import { getDeletionProtectionPrintableStatus } from '@virtualmachines/details/tabs/configuration/details/components/DeletionProtection/utils/utils';
import useDuration from '@virtualmachines/details/tabs/metrics/hooks/useDuration';
import { filterConditions } from '@virtualmachines/list/components/VirtualMachineRow/utils/utils';
import { deselectVM, isVMSelected, selectVM } from '@virtualmachines/list/selectedVMs';
import { getVirtualMachineStorageClasses, PVCMapper } from '@virtualmachines/utils/mappers';

import { VMStatusConditionLabelList } from '../VMStatusConditionLabel';

import CPUPercentage from './components/CPUPercentage';
import MemoryPercentage from './components/MemoryPercentage';
import NetworkPercentage from './components/NetworkPercentage';

import './virtual-machine-row-layout.scss';

const VirtualMachineRowLayout: FC<
  RowProps<
    V1VirtualMachine,
    {
      ips: ReactNode | string;
      node: ReactNode | string;
      pvcMapper: PVCMapper;
      status: ReactNode;
      vmi?: V1VirtualMachineInstance;
      vmim: V1VirtualMachineInstanceMigration;
    }
  >
> = ({ activeColumnIDs, index, obj, rowData: { ips, node, pvcMapper, status, vmi, vmim } }) => {
  // TODO: investigate using the index prop
  index;
  const selected = isVMSelected(obj);
  const { duration } = useDuration();
  const queries = useMemo(() => getUtilizationQueries({ duration, obj: vmi }), [vmi, duration]);
  const vmName = useMemo(() => getName(obj), [obj]);
  const vmNamespace = useMemo(() => getNamespace(obj), [obj]);
  const clusterParam = useClusterParam();
  const vmCluster = getCluster(obj) ?? clusterParam;

  const storageClasses = useMemo(
    () => getVirtualMachineStorageClasses(obj, pvcMapper),
    [obj, pvcMapper],
  );

  const [actions] = useVirtualMachineActionsProvider(obj, vmim);

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
        <MulticlusterResourceLink
          cluster={vmCluster}
          groupVersionKind={VirtualMachineModelGroupVersionKind}
          name={vmName}
          namespace={vmNamespace}
        />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="vm-column" id="cluster">
        <MulticlusterResourceLink
          groupVersionKind={modelToGroupVersionKind(ManagedClusterModel)}
          name={vmCluster}
          truncate
        />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="vm-column" id="namespace">
        <MulticlusterResourceLink
          cluster={vmCluster}
          groupVersionKind={modelToGroupVersionKind(NamespaceModel)}
          name={vmNamespace}
          truncate
        />
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
        <MemoryPercentage vm={obj} vmiMemory={getMemory(vmi)} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="vm-column" id="cpu-usage">
        <CPUPercentage queries={queries} vm={obj} vmi={vmi} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="vm-column" id="network-usage">
        <NetworkPercentage queries={queries} vm={obj} vmi={vmi} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="vm-column" id="deletion-protection">
        {getDeletionProtectionPrintableStatus(obj)}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="vm-column" id="storageclassname">
        {isEmpty(storageClasses)
          ? NO_DATA_DASH
          : storageClasses.map((storageClass) => (
              <MulticlusterResourceLink
                cluster={vmCluster}
                groupVersionKind={modelToGroupVersionKind(StorageClassModel)}
                key={storageClass}
                name={storageClass}
              />
            ))}
      </TableData>
      <ACMExtentionsTableData activeColumnIDs={activeColumnIDs} vm={obj} />
      <TableData activeColumnIDs={activeColumnIDs} className="pf-v6-c-table__action" id="">
        <VirtualMachineActions actions={actions} data-test="row-action" isKebabToggle vm={obj} />
      </TableData>
    </>
  );
};

export default VirtualMachineRowLayout;
