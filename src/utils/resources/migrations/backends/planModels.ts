import {
  MigPlanModel,
  MultiNamespaceVirtualMachineStorageMigrationPlanModel,
  VirtualMachineStorageMigrationPlanModel,
} from '@kubevirt-utils/models';
import type { K8sModel } from '@openshift-console/dynamic-plugin-sdk';

const STORAGE_MIGRATION_PLAN_MODELS: K8sModel[] = [
  MultiNamespaceVirtualMachineStorageMigrationPlanModel,
  VirtualMachineStorageMigrationPlanModel,
  MigPlanModel,
];

export const getStorageMigrationPlanModelForKind = (kind?: string): K8sModel => {
  const found = STORAGE_MIGRATION_PLAN_MODELS.find((m) => m.kind === kind);
  if (found) {
    return found;
  }
  if (!kind) {
    return MultiNamespaceVirtualMachineStorageMigrationPlanModel;
  }
  throw new Error(`Unknown storage migration plan kind: ${kind}`);
};
