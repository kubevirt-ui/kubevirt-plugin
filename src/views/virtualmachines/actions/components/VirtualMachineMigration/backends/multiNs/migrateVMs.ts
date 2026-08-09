import groupBy from 'lodash/groupBy';
import isEmpty from 'lodash/isEmpty';

import {
  MultiNamespaceVirtualMachineStorageMigrationModel,
  MultiNamespaceVirtualMachineStorageMigrationPlanModel,
} from '@kubevirt-utils/models';
import {
  type MultiNamespaceVirtualMachineStorageMigration,
  type MultiNamespaceVirtualMachineStorageMigrationPlan,
  STORAGE_MIGRATION_PLAN_RETENTION_POLICY,
} from '@kubevirt-utils/resources/migrations/constants';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getRandomChars, truncateToK8sName } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';

import type { MigrateVMsParams } from '../types';

import { MIGPLAN_PREFIX, MIGRATION_PREFIX } from '../../utils/constants';

export const getEmptyMigPlan = (
  namespace: string,
  planName?: string,
): MultiNamespaceVirtualMachineStorageMigrationPlan => ({
  apiVersion: `${MultiNamespaceVirtualMachineStorageMigrationPlanModel.apiGroup}/${MultiNamespaceVirtualMachineStorageMigrationPlanModel.apiVersion}`,
  kind: MultiNamespaceVirtualMachineStorageMigrationPlanModel.kind,
  metadata: {
    name: planName?.trim() ? planName : `${MIGPLAN_PREFIX}-${getRandomChars()}`,
    namespace,
  },
  spec: {
    namespaces: [],
  },
});

export const getMigration = (
  migrationPlan: MultiNamespaceVirtualMachineStorageMigrationPlan,
): MultiNamespaceVirtualMachineStorageMigration => ({
  apiVersion: `${MultiNamespaceVirtualMachineStorageMigrationModel.apiGroup}/${MultiNamespaceVirtualMachineStorageMigrationModel.apiVersion}`,
  kind: MultiNamespaceVirtualMachineStorageMigrationModel.kind,
  metadata: {
    name: truncateToK8sName(
      `${MIGRATION_PREFIX}-${getName(migrationPlan) ?? getRandomChars()}`,
      '',
    ),
    namespace: getNamespace(migrationPlan),
  },
  spec: {
    multiNamespaceVirtualMachineStorageMigrationPlanRef: {
      name: getName(migrationPlan),
    },
  },
});

export const migrateVMs = async ({
  cluster,
  destinationStorageClass,
  keepOriginalVolumes,
  migrationPlanName,
  selectedMigrations,
}: MigrateVMsParams): Promise<MultiNamespaceVirtualMachineStorageMigrationPlan> => {
  if (isEmpty(selectedMigrations)) {
    throw new Error('No migrations selected');
  }

  const migrationPlan = getEmptyMigPlan(getNamespace(selectedMigrations[0].pvc), migrationPlanName);

  const migrationsPerNamespace = groupBy(selectedMigrations, 'vmNamespace') as Record<
    string,
    typeof selectedMigrations
  >;

  for (const [namespace, migrations] of Object.entries(migrationsPerNamespace)) {
    const namespaceMigrations = {
      name: namespace,
      retentionPolicy: keepOriginalVolumes
        ? STORAGE_MIGRATION_PLAN_RETENTION_POLICY.KEEP_SOURCE
        : STORAGE_MIGRATION_PLAN_RETENTION_POLICY.DELETE_SOURCE,
      virtualMachines: [],
    };

    // NOTE: properly type migrationsPerVM
    const migrationsPerVM = groupBy(migrations, 'vmName') as Record<
      string,
      typeof selectedMigrations
    >;

    for (const [vmName, vmMigrations] of Object.entries(migrationsPerVM)) {
      namespaceMigrations.virtualMachines.push({
        name: vmName,
        targetMigrationPVCs: vmMigrations.map((migration) => ({
          destinationPVC: {
            storageClassName: destinationStorageClass,
          },
          volumeName: migration.volumeName,
        })),
      });
    }

    migrationPlan.spec.namespaces.push(namespaceMigrations);
  }

  const createdMigrationPlan =
    await kubevirtK8sCreate<MultiNamespaceVirtualMachineStorageMigrationPlan>({
      cluster,
      data: migrationPlan,
      model: MultiNamespaceVirtualMachineStorageMigrationPlanModel,
    });

  await kubevirtK8sCreate<MultiNamespaceVirtualMachineStorageMigration>({
    cluster,
    data: getMigration(createdMigrationPlan),
    model: MultiNamespaceVirtualMachineStorageMigrationModel,
  });

  return createdMigrationPlan;
};
