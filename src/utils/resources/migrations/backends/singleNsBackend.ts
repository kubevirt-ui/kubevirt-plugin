import { VirtualMachineStorageMigrationPlanModel } from '@kubevirt-utils/models';
import { migrateVMsSingleNs } from '@virtualmachines/actions/components/VirtualMachineMigration/backends/singleNs/migrateVMs';

import { STORAGE_MIGRATION_API, type VirtualMachineStorageMigrationPlan } from '../constants';

import { normalizeSingleNsPlan } from '../singleNs/overview';
import type {
  StorageMigrationBackendDescriptor,
  StorageMigrationPlanOverviewNormalizer,
} from './types';

const normalizePlanForOverview: StorageMigrationPlanOverviewNormalizer = (plan) =>
  normalizeSingleNsPlan(plan as VirtualMachineStorageMigrationPlan);

export const singleNsBackend: StorageMigrationBackendDescriptor = {
  api: STORAGE_MIGRATION_API.SINGLE_NS,
  migrateVMs: migrateVMsSingleNs,
  normalizePlanForOverview,
  overviewUsesClusterScopedPlanWatch: false,
  planModel: VirtualMachineStorageMigrationPlanModel,
};
