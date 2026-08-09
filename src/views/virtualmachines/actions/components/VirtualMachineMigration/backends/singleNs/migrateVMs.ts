import groupBy from 'lodash/groupBy';

import {
  VirtualMachineStorageMigrationModel,
  VirtualMachineStorageMigrationPlanModel,
} from '@kubevirt-utils/models';
import {
  type MultiNamespaceVirtualMachineStorageMigrationPlan,
  STORAGE_MIGRATION_PLAN_RETENTION_POLICY,
  type VirtualMachineStorageMigration,
  type VirtualMachineStorageMigrationPlan,
} from '@kubevirt-utils/resources/migrations/constants';
import { normalizeSingleNsPlan } from '@kubevirt-utils/resources/migrations/singleNs/overview';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getRandomChars, truncateToK8sName } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';

import type { MigrateVMsParams } from '../types';

import { MIGPLAN_PREFIX, MIGRATION_PREFIX } from '../../utils/constants';

export const getEmptySingleNsMigPlan = (
  namespace: string,
  planName?: string,
): VirtualMachineStorageMigrationPlan => ({
  apiVersion: `${VirtualMachineStorageMigrationPlanModel.apiGroup}/${VirtualMachineStorageMigrationPlanModel.apiVersion}`,
  kind: VirtualMachineStorageMigrationPlanModel.kind,
  metadata: {
    name: planName?.trim() ? planName : `${MIGPLAN_PREFIX}-${getRandomChars()}`,
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
      `${MIGRATION_PREFIX}-${getName(migrationPlan) ?? getRandomChars()}`,
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
    selectedMigrations.map((mig) => mig.vmNamespace ?? getNamespace(mig.pvc)),
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

  const migrationsPerVM = groupBy(selectedMigrations, 'vmName') as Record<
    string,
    typeof selectedMigrations
  >;

  for (const [vmName, vmMigrations] of Object.entries(migrationsPerVM)) {
    migrationPlan.spec.virtualMachines.push({
      name: vmName,
      targetMigrationPVCs: vmMigrations.map((migration) => ({
        destinationPVC: {
          storageClassName: destinationStorageClass,
        },
        volumeName: migration.volumeName,
      })),
    });
  }

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
  const normalizedPlan = normalizeSingleNsPlan(createdPlan);
  if (!normalizedPlan) throw new Error('Failed to normalize single-namespace migration plan');
  return normalizedPlan;
};
