import { MultiNamespaceVirtualMachineStorageMigrationPlanModel } from '@kubevirt-utils/models';
import type { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { migrateVMs } from '@virtualmachines/actions/components/VirtualMachineMigration/backends/multiNs/migrateVMs';

import type { MultiNamespaceVirtualMachineStorageMigrationPlan } from '../constants';
import { STORAGE_MIGRATION_API } from '../constants';

import type { StorageMigrationBackendDescriptor } from './types';

const normalizePlanForOverview = (
  plan: K8sResourceCommon,
): MultiNamespaceVirtualMachineStorageMigrationPlan =>
  plan as MultiNamespaceVirtualMachineStorageMigrationPlan;

export const multiNsBackend: StorageMigrationBackendDescriptor = {
  api: STORAGE_MIGRATION_API.MULTI_NS,
  listConsolePathUsesResourceUrl: true,
  migrateVMs,
  normalizePlanForOverview,
  overviewUsesClusterScopedPlanWatch: true,
  planModel: MultiNamespaceVirtualMachineStorageMigrationPlanModel,
};
