import { MigPlanModel } from '@kubevirt-utils/models';
import { migrateVMsMTC } from '@virtualmachines/actions/components/VirtualMachineMigration/backends/mtc/migrateVMs';

import { type MigPlan } from '../constants';
import { MTC_MIGRATION_NAMESPACE, STORAGE_MIGRATION_API } from '../constants';
import { normalizeMTCPlanForOverview } from '../mtc';

import type {
  StorageMigrationBackendDescriptor,
  StorageMigrationPlanOverviewNormalizer,
} from './types';

const normalizePlanForOverview: StorageMigrationPlanOverviewNormalizer = (plan) =>
  normalizeMTCPlanForOverview(plan as MigPlan);

export const mtcBackend: StorageMigrationBackendDescriptor = {
  api: STORAGE_MIGRATION_API.MTC,
  fixedPlanNamespace: MTC_MIGRATION_NAMESPACE,
  migrateVMs: migrateVMsMTC,
  normalizePlanForOverview,
  overviewUsesClusterScopedPlanWatch: false,
  planModel: MigPlanModel,
};
