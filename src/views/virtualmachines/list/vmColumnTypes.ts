// Extracted from virtualMachinesDefinition.tsx
// Root: src/views/virtualmachines/list/virtualMachinesDefinition.tsx

import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
  type V1VirtualMachineInstanceMigration,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { ACTIONS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
import { type PVCMapper, type VMIMapper, type VMIMMapper } from '@virtualmachines/utils/mappers';

export const VM_COLUMN_KEYS = {
  actions: ACTIONS,
  cluster: 'cluster',
  conditions: 'conditions',
  cpuUsage: 'cpu-usage',
  created: 'created',
  deletionProtection: 'deletion-protection',
  ipAddress: 'ip-address',
  memoryUsage: 'memory-usage',
  name: 'name',
  namespace: 'namespace',
  networkUsage: 'network-usage',
  node: 'node',
  selection: 'selection',
  status: 'status',
  storageclassname: 'storageclassname',
} as const;

export type VMCallbacks = {
  getVmi: (vm: V1VirtualMachine) => undefined | V1VirtualMachineInstance;
  getVmim: (vm: V1VirtualMachine) => undefined | V1VirtualMachineInstanceMigration;
  pvcMapper: PVCMapper;
  vmiMapper: VMIMapper;
  vmimMapper: VMIMMapper;
};

export type VMColumn = ColumnConfig<V1VirtualMachine, VMCallbacks>;
