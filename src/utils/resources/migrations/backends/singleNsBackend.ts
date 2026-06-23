import { VirtualMachineStorageMigrationPlanModel } from '@kubevirt-utils/models';
import type { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { migrateVMsSingleNs } from '@virtualmachines/actions/components/VirtualMachineMigration/backends/singleNs/migrateVMs';

import { type VirtualMachineStorageMigrationPlan, STORAGE_MIGRATION_API } from '../constants';
import { normalizeSingleNsPlan } from '../singleNs/overview';

import type { StorageMigrationBackendDescriptor } from './types';

const normalizePlanForOverview = (plan: K8sResourceCommon) =>
  normalizeSingleNsPlan(plan as VirtualMachineStorageMigrationPlan);

export const singleNsBackend: StorageMigrationBackendDescriptor = {
  api: STORAGE_MIGRATION_API.SINGLE_NS,
  listConsolePathUsesResourceUrl: false,
  migrateVMs: migrateVMsSingleNs,
  normalizePlanForOverview,
  overviewUsesClusterScopedPlanWatch: false,
  planModel: VirtualMachineStorageMigrationPlanModel,
};
