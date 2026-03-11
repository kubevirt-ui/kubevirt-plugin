import groupBy from 'lodash/groupBy';

import {
  MultiNamespaceVirtualMachineStorageMigrationModel,
  MultiNamespaceVirtualMachineStorageMigrationPlanModel,
} from '@kubevirt-utils/models';
import {
  MultiNamespaceVirtualMachineStorageMigration,
  MultiNamespaceVirtualMachineStorageMigrationPlan,
} from '@kubevirt-utils/resources/migrations/constants';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getRandomChars, truncateToK8sName } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';

import { MIGPLAN_PREFIX, MIGRATION_PREFIX, SelectedMigration } from './constants';

export const generateMigPlanName = (
  selectedMigrations: SelectedMigration[],
  destinationStorageClass: string,
): string => {
  const vmNames = selectedMigrations.map((m) => m.vmName).filter(Boolean);

  const vmPart = vmNames.length === 1 ? vmNames[0] : `${vmNames.length || 0}vms`;

  return truncateToK8sName(`${MIGPLAN_PREFIX}-${vmPart}-to-${destinationStorageClass}`);
};

export const getEmptyMigPlan = (
  namespace: string,
  selectedMigrations: SelectedMigration[],
  destinationStorageClass: string,
): MultiNamespaceVirtualMachineStorageMigrationPlan => ({
  apiVersion: `${MultiNamespaceVirtualMachineStorageMigrationPlanModel.apiGroup}/${MultiNamespaceVirtualMachineStorageMigrationPlanModel.apiVersion}`,
  kind: MultiNamespaceVirtualMachineStorageMigrationPlanModel.kind,
  metadata: {
    name: generateMigPlanName(selectedMigrations, destinationStorageClass),
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

export const migrateVMs = async (
  selectedMigrations: SelectedMigration[],
  destinationStorageClass: string,
  cluster: string,
) => {
  const migrationPlan = getEmptyMigPlan(
    getNamespace(selectedMigrations?.[0].pvc),
    selectedMigrations,
    destinationStorageClass,
  );

  const migrationsPerNamespace = groupBy(selectedMigrations, 'vmNamespace');

  Object.entries(migrationsPerNamespace).forEach(([namespace, migrations]) => {
    const namespaceMigrations = { name: namespace, virtualMachines: [] };

    migrations.forEach((migration) => {
      namespaceMigrations.virtualMachines.push({
        name: migration.vmName,
        targetMigrationPVCs: [
          {
            destinationPVC: {
              storageClassName: destinationStorageClass,
            },
            volumeName: migration.volumeName,
          },
        ],
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
    data: getMigration(migrationPlan),
    model: MultiNamespaceVirtualMachineStorageMigrationModel,
  });

  return createdMigrationPlan;
};
