import groupBy from 'lodash/groupBy';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
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
import { getRandomChars, truncateToK8sName } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';

import { MIGPLAN_PREFIX, MIGRATION_PREFIX, SelectedMigration } from './constants';

export const generateMigPlanName = (vms: V1VirtualMachine[]): string => {
  const vmNames = vms.map((vm) => getName(vm)).filter(Boolean);
  const vmPart = vmNames.length === 1 ? vmNames[0] : `${vmNames.length || 0}vms`;

  return truncateToK8sName(`${MIGPLAN_PREFIX}-${vmPart}`, getRandomChars());
};

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

type MigrateVMsParams = {
  cluster: string;
  destinationStorageClass: string;
  keepOriginalVolumes: boolean;
  migrationPlanName?: string;
  selectedMigrations: SelectedMigration[];
};

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
