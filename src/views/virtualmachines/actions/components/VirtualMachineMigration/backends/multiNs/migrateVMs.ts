import groupBy from 'lodash/groupBy';

import {
  MultiNamespaceVirtualMachineStorageMigrationModel,
  MultiNamespaceVirtualMachineStorageMigrationPlanModel,
} from '@kubevirt-utils/models';
import {
  MultiNamespaceVirtualMachineStorageMigration,
  MultiNamespaceVirtualMachineStorageMigrationPlan,
  STORAGE_MIGRATION_PLAN_RETENTION_POLICY,
} from '@kubevirt-utils/resources/migrations/constants';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getRandomChars } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';

import { MIGPLAN_PREFIX, MIGRATION_PREFIX } from '../../utils/constants';
import { truncateToK8sName } from '../../utils/shared';
import type { MigrateVMsParams } from '../types';

export const getEmptyMigPlan = (
  namespace: string,
  planName?: string,
): MultiNamespaceVirtualMachineStorageMigrationPlan => ({
  apiVersion: `${MultiNamespaceVirtualMachineStorageMigrationPlanModel.apiGroup}/${MultiNamespaceVirtualMachineStorageMigrationPlanModel.apiVersion}`,
  kind: MultiNamespaceVirtualMachineStorageMigrationPlanModel.kind,
  metadata: {
    name: planName || `${MIGPLAN_PREFIX}-${getRandomChars()}`,
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
      `${MIGRATION_PREFIX}-${getName(migrationPlan) || getRandomChars()}`,
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
}: MigrateVMsParams) => {
  const migrationPlan = getEmptyMigPlan(
    getNamespace(selectedMigrations?.[0].pvc),
    migrationPlanName,
  );

  const migrationsPerNamespace = groupBy(selectedMigrations, 'vmNamespace');

  Object.entries(migrationsPerNamespace).forEach(([namespace, migrations]) => {
    const namespaceMigrations = {
      name: namespace,
      retentionPolicy: keepOriginalVolumes
        ? STORAGE_MIGRATION_PLAN_RETENTION_POLICY.KEEP_SOURCE
        : STORAGE_MIGRATION_PLAN_RETENTION_POLICY.DELETE_SOURCE,
      virtualMachines: [],
    };

    // TODO: properly type migrationsPerVM
    const migrationsPerVM: Record<string, any[]> = groupBy(migrations, 'vmName');

    Object.entries(migrationsPerVM).forEach(([vmName, vmMigrations]) => {
      namespaceMigrations.virtualMachines.push({
        name: vmName,
        targetMigrationPVCs: vmMigrations.map((migration) => ({
          destinationPVC: {
            storageClassName: destinationStorageClass,
          },
          volumeName: migration.volumeName,
        })),
      });
    });

    migrationPlan.spec.namespaces.push(namespaceMigrations);
  });

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
