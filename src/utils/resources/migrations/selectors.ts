import { MultiNamespaceVirtualMachineStorageMigrationPlan } from './constants';

export const getStorageMigrationPlanSpecNamespaces = (
  plan?: Pick<MultiNamespaceVirtualMachineStorageMigrationPlan, 'spec'>,
): MultiNamespaceVirtualMachineStorageMigrationPlan['spec']['namespaces'] =>
  plan?.spec?.namespaces ?? [];
