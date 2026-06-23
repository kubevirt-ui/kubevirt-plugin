import { MigPlanModel } from '@kubevirt-utils/models';
import type { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { migrateVMsMTC } from '@virtualmachines/actions/components/VirtualMachineMigration/backends/mtc/migrateVMs';

import type { MigPlan } from '../constants';
import { MTC_MIGRATION_NAMESPACE, STORAGE_MIGRATION_API } from '../constants';
import { normalizeMTCPlanForOverview } from '../mtc';

import type { StorageMigrationBackendDescriptor } from './types';

const normalizePlanForOverview = (plan: K8sResourceCommon) =>
  normalizeMTCPlanForOverview(plan as MigPlan);

export const mtcBackend: StorageMigrationBackendDescriptor = {
  api: STORAGE_MIGRATION_API.MTC,
  fixedPlanNamespace: MTC_MIGRATION_NAMESPACE,
  listConsolePathUsesResourceUrl: false,
  migrateVMs: migrateVMsMTC,
  normalizePlanForOverview,
  overviewUsesClusterScopedPlanWatch: false,
  planModel: MigPlanModel,
};
