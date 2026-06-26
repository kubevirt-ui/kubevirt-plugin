import groupBy from 'lodash/groupBy';

import {
  VirtualMachineStorageMigrationModel,
  VirtualMachineStorageMigrationPlanModel,
} from '@kubevirt-utils/models';
import {
  MultiNamespaceVirtualMachineStorageMigrationPlan,
  STORAGE_MIGRATION_PLAN_RETENTION_POLICY,
  VirtualMachineStorageMigration,
  VirtualMachineStorageMigrationPlan,
} from '@kubevirt-utils/resources/migrations/constants';
import { normalizeSingleNsPlan } from '@kubevirt-utils/resources/migrations/singleNs/overview';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getRandomChars } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';

import { MIGPLAN_PREFIX, MIGRATION_PREFIX } from '../../utils/constants';
import { truncateToK8sName } from '../../utils/shared';
import type { MigrateVMsParams } from '../types';

export const getEmptySingleNsMigPlan = (
  namespace: string,
  planName?: string,
): VirtualMachineStorageMigrationPlan => ({
  apiVersion: `${VirtualMachineStorageMigrationPlanModel.apiGroup}/${VirtualMachineStorageMigrationPlanModel.apiVersion}`,
  kind: VirtualMachineStorageMigrationPlanModel.kind,
  metadata: {
    name: planName || `${MIGPLAN_PREFIX}-${getRandomChars()}`,
    namespace,
  },
  spec: {
    virtualMachines: [],
  },
});

export const getSingleNsMigration = (
  migrationPlan: VirtualMachineStorageMigrationPlan,
): VirtualMachineStorageMigration => ({
  apiVersion: `${VirtualMachineStorageMigrationModel.apiGroup}/${VirtualMachineStorageMigrationModel.apiVersion}`,
  kind: VirtualMachineStorageMigrationModel.kind,
  metadata: {
    name: truncateToK8sName(
      `${MIGRATION_PREFIX}-${getName(migrationPlan) || getRandomChars()}`,
      '',
    ),
    namespace: getNamespace(migrationPlan),
  },
  spec: {
    virtualMachineStorageMigrationPlanRef: {
      name: getName(migrationPlan),
    },
  },
});

/**
 * Creates a VirtualMachineStorageMigrationPlan (single-namespace KubeVirt API)
 * and the associated VirtualMachineStorageMigration trigger resource.
 * Returns the created plan normalized to the multi-namespace shape so callers
 * can use shared status-tracking utilities.
 */
export const migrateVMsSingleNs = async ({
  cluster,
  destinationStorageClass,
  keepOriginalVolumes,
  migrationPlanName,
  selectedMigrations,
}: MigrateVMsParams): Promise<MultiNamespaceVirtualMachineStorageMigrationPlan> => {
  if (!selectedMigrations?.length) {
    throw new Error('selectedMigrations must contain at least one entry.');
  }

  const namespace = getNamespace(selectedMigrations[0].pvc);

  const uniqueNamespaces = new Set(
    selectedMigrations.map((m) => m.vmNamespace ?? getNamespace(m.pvc)),
  );
  if (uniqueNamespaces.size > 1) {
    throw new Error(
      'Single-namespace storage migration API does not support cross-namespace migrations. All VMs must be in the same namespace.',
    );
  }

  const migrationPlan = getEmptySingleNsMigPlan(namespace, migrationPlanName);

  migrationPlan.spec.retentionPolicy = keepOriginalVolumes
    ? STORAGE_MIGRATION_PLAN_RETENTION_POLICY.KEEP_SOURCE
    : STORAGE_MIGRATION_PLAN_RETENTION_POLICY.DELETE_SOURCE;

  const migrationsPerVM: Record<string, typeof selectedMigrations> = groupBy(
    selectedMigrations,
    'vmName',
  );

  Object.entries(migrationsPerVM).forEach(([vmName, vmMigrations]) => {
    migrationPlan.spec.virtualMachines.push({
      name: vmName,
      targetMigrationPVCs: vmMigrations.map((migration) => ({
        destinationPVC: {
          storageClassName: destinationStorageClass,
        },
        volumeName: migration.volumeName,
      })),
    });
  });

  const createdPlan = await kubevirtK8sCreate<VirtualMachineStorageMigrationPlan>({
    cluster,
    data: migrationPlan,
    model: VirtualMachineStorageMigrationPlanModel,
  });

  await kubevirtK8sCreate<VirtualMachineStorageMigration>({
    cluster,
    data: getSingleNsMigration(createdPlan),
    model: VirtualMachineStorageMigrationModel,
  });

  // kubevirtK8sCreate throws on failure, so createdPlan is always defined here.
  const normalized = normalizeSingleNsPlan(createdPlan);
  if (!normalized) {
    throw new Error('Failed to normalize created storage migration plan.');
  }
  return normalized;
};
