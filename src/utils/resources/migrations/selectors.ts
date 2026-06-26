import {
  MultiNamespaceVirtualMachineStorageMigrationPlan,
  StorageMigrationPlanNamespaceStatus,
} from './constants';

export const getStatusNamespaces = (
  plan: MultiNamespaceVirtualMachineStorageMigrationPlan,
): StorageMigrationPlanNamespaceStatus[] | undefined => plan?.status?.namespaces;

export const getStorageMigrationPlanSpecNamespaces = (
  plan?: Pick<MultiNamespaceVirtualMachineStorageMigrationPlan, 'spec'>,
): MultiNamespaceVirtualMachineStorageMigrationPlan['spec']['namespaces'] =>
  plan?.spec?.namespaces ?? [];
