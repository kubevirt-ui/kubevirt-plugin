import React from 'react';

import {
  V1VirtualMachine,
  V1VirtualMachineInstance,
  V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  modelToGroupVersionKind,
  NodeModel,
  StorageClassModel,
  VirtualMachineModelGroupVersionKind,
} from '@kubevirt-utils/models';
import { getName, getNamespace, getVMStatus } from '@kubevirt-utils/resources/shared';
import { getMemory, getStatusConditions } from '@kubevirt-utils/resources/vm';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getVMIIPAddressesWithName } from '@kubevirt-utils/resources/vmi';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { ResourceLink, Timestamp } from '@openshift-console/dynamic-plugin-sdk';
import { Checkbox } from '@patternfly/react-core';
import { DataViewTr } from '@patternfly/react-data-view';
import { getDeletionProtectionPrintableStatus } from '@virtualmachines/details/tabs/configuration/details/components/DeletionProtection/utils/utils';
import VirtualMachineMigrationPercentage from '@virtualmachines/details/tabs/overview/components/VirtualMachinesOverviewTabDetails/components/VirtualMachineMigrationPercentage';
import StatusWithPopover from '@virtualmachines/details/tabs/overview/components/VirtualMachinesOverviewTabDetails/components/VirtualMachineStatusWithPopover/VirtualMachineStatusWithPopover';
import { deselectVM, isVMSelected, selectVM } from '@virtualmachines/list/selectedVMs';
import { printableVMStatus } from '@virtualmachines/utils';
import { getVirtualMachineStorageClasses, PVCMapper } from '@virtualmachines/utils/mappers';

import FirstItemListPopover from '../FirstItemListPopover/FirstItemListPopover';
import { VMStatusConditionLabelList } from '../VMStatusConditionLabel';

import CPUPercentage from './components/CPUPercentage';
import MemoryPercentage from './components/MemoryPercentage';
import NetworkUsage from './components/NetworkUsage';
import VirtualMachineRowActions from './components/VirtualMachineRowActions';

export type GetVirtualMachineRowTDsType = (props: {
  activeColumnsIDs: string[];
  getVMI: (namespace: string, name: string) => V1VirtualMachineInstance;
  getVMIM: (ns: string, name: string) => V1VirtualMachineInstanceMigration;
  isSingleNodeCluster: boolean;
  pvcMapper: PVCMapper;
  vm: V1VirtualMachine;
}) => DataViewTr;

export const getVirtualMachineRowTDs: GetVirtualMachineRowTDsType = ({
  activeColumnsIDs,
  getVMI,
  getVMIM,
  isSingleNodeCluster,
  pvcMapper,
  vm,
}) => {
  const storageClasses = getVirtualMachineStorageClasses(vm, pvcMapper);
  const vmName = getName(vm);
  const vmNamespace = getNamespace(vm);
  const vmi = getVMI(vmNamespace, vmName);
  const vmim = getVMIM(vmNamespace, vmName);

  const ipAddressess = vmi && getVMIIPAddressesWithName(vmi);
  const selected = isVMSelected(vm);
  const vmiMemory = getMemory(vmi);

  return [
    {
      cell: (
        <Checkbox
          id={`select-${vm?.metadata?.uid}`}
          isChecked={selected}
          onChange={() => (selected ? deselectVM(vm) : selectVM(vm))}
        />
      ),
      id: '',
      props: { className: 'selection-column vm-column' },
    },
    {
      cell: (
        <ResourceLink
          groupVersionKind={VirtualMachineModelGroupVersionKind}
          name={vmName}
          namespace={vmNamespace}
        />
      ),
      id: 'name',
      props: { className: 'pf-m-width-20 vm-column' },
    },
    {
      cell: <ResourceLink kind="Namespace" name={vmNamespace} truncate />,
      id: 'namespace',
      props: { className: 'vm-column' },
    },
    {
      cell: (
        <>
          <StatusWithPopover vm={vm} vmi={vmi} />
          {getVMStatus(vm) === printableVMStatus.Migrating && (
            <VirtualMachineMigrationPercentage vm={vm} />
          )}
        </>
      ),
      id: 'status',
      props: { className: 'vm-column' },
    },
    {
      cell: (
        <VMStatusConditionLabelList conditions={getStatusConditions(vm)?.filter((c) => c.reason)} />
      ),
      id: 'conditions',
      props: { className: 'vm-column' },
    },
    {
      cell: (
        <ResourceLink
          groupVersionKind={modelToGroupVersionKind(NodeModel)}
          name={vmi?.status?.nodeName}
          truncate
        />
      ),
      id: 'node',
      props: { className: 'vm-column' },
    },
    {
      cell: <Timestamp timestamp={vm?.metadata?.creationTimestamp} />,
      id: 'created',
      props: { className: 'vm-column' },
    },
    {
      cell: <FirstItemListPopover headerContent={t('IP addresses')} items={ipAddressess} />,
      id: 'ip-address',
      props: { className: 'vm-column' },
    },
    {
      cell: <MemoryPercentage vmiMemory={vmiMemory} vmName={vmName} vmNamespace={vmNamespace} />,
      id: 'memory-usage',
      props: { className: 'vm-column' },
    },
    {
      cell: <CPUPercentage vmName={vmName} vmNamespace={vmNamespace} />,
      id: 'cpu-usage',
      props: { className: 'vm-column' },
    },
    {
      cell: <NetworkUsage vmName={vmName} vmNamespace={vmNamespace} />,
      id: 'network-usage',
      props: { className: 'vm-column' },
    },
    {
      cell: <>{getDeletionProtectionPrintableStatus(vm)}</>,
      id: 'deletion-protection',
      props: { className: 'vm-column' },
    },
    {
      cell: (
        <>
          {isEmpty(storageClasses)
            ? NO_DATA_DASH
            : storageClasses.map((storageClass) => (
                <ResourceLink
                  groupVersionKind={modelToGroupVersionKind(StorageClassModel)}
                  key={storageClass}
                  name={storageClass}
                />
              ))}
        </>
      ),
      id: 'storageclassname',
      props: { className: 'vm-column' },
    },
    {
      cell: (
        <VirtualMachineRowActions isSingleNodeCluster={isSingleNodeCluster} vm={vm} vmim={vmim} />
      ),
      id: '',
      props: { className: 'pf-v6-c-table__action' },
    },
  ].filter((td) => activeColumnsIDs.includes(td.id));
};
