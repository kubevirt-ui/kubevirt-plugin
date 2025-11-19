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
import { getRandomChars } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';

import { SelectedMigration } from './constants';

export const getEmptyMigPlan = (
  namespace: string,
): MultiNamespaceVirtualMachineStorageMigrationPlan => ({
  apiVersion: `${MultiNamespaceVirtualMachineStorageMigrationPlanModel.apiGroup}/${MultiNamespaceVirtualMachineStorageMigrationPlanModel.apiVersion}`,
  kind: MultiNamespaceVirtualMachineStorageMigrationPlanModel.kind,
  metadata: {
    name: `migplan-${getRandomChars()}`,
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
    name: `migration-${getName(migrationPlan) || getRandomChars()}`,
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
  const migrationPlan = getEmptyMigPlan(getNamespace(selectedMigrations?.[0].pvc));

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
