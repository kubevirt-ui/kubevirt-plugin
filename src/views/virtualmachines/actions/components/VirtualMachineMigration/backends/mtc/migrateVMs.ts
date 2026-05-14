import { MigMigrationModel, MigPlanModel } from '@kubevirt-utils/models';
import {
  MigMigration,
  MigPlan,
  MTC_MIGRATION_NAMESPACE,
  MTC_PV_ACTION_COPY,
  MTC_PV_COPY_METHOD_FILESYSTEM,
  MultiNamespaceVirtualMachineStorageMigrationPlan,
  STORAGE_MIGRATION_PLAN_RETENTION_POLICY,
} from '@kubevirt-utils/resources/migrations/constants';
import {
  buildKubeVirtShapedSpecFromMigrations,
  normalizeMTCPlan,
} from '@kubevirt-utils/resources/migrations/mtc';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getRandomChars, kubevirtConsole, truncateToK8sName } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sCreate, kubevirtK8sDelete } from '@multicluster/k8sRequests';

import { MIGPLAN_PREFIX, MIGRATION_PREFIX } from '../../utils/constants';
import type { MigrateVMsParams } from '../types';

const MTC_HOST_CLUSTER_REF = { name: 'host', namespace: MTC_MIGRATION_NAMESPACE };

const MTC_PV_SUPPORTED = {
  actions: [MTC_PV_ACTION_COPY],
  copyMethods: [MTC_PV_COPY_METHOD_FILESYSTEM],
} as const;

/**
 * Creates MTC MigPlan + MigMigration on clusters that only expose migration.openshift.io
 * (no migrations.kubevirt.io). Returns a KubeVirt-shaped plan for shared progress UI; rolls back
 * the MigPlan if MigMigration creation fails.
 */
export const migrateVMsMTC = async ({
  cluster,
  destinationStorageClass,
  keepOriginalVolumes,
  migrationPlanName,
  selectedMigrations,
}: MigrateVMsParams): Promise<MultiNamespaceVirtualMachineStorageMigrationPlan> => {
  const retentionPolicy = keepOriginalVolumes
    ? STORAGE_MIGRATION_PLAN_RETENTION_POLICY.KEEP_SOURCE
    : STORAGE_MIGRATION_PLAN_RETENTION_POLICY.DELETE_SOURCE;

  const kubeVirtShapedSpec = buildKubeVirtShapedSpecFromMigrations(
    selectedMigrations,
    destinationStorageClass,
    retentionPolicy,
  );

  const namespaceSet = new Set(selectedMigrations.map((m) => m.vmNamespace ?? getNamespace(m.pvc)));

  const migPlan: MigPlan = {
    apiVersion: `${MigPlanModel.apiGroup}/${MigPlanModel.apiVersion}`,
    kind: MigPlanModel.kind,
    metadata: {
      name: migrationPlanName || `${MIGPLAN_PREFIX}-${getRandomChars()}`,
      namespace: MTC_MIGRATION_NAMESPACE,
    },
    spec: {
      destMigClusterRef: MTC_HOST_CLUSTER_REF,
      liveMigrate: true,
      namespaces: [...namespaceSet],
      persistentVolumes: selectedMigrations.map((m) => ({
        pvc: {
          name: getName(m.pvc),
          namespace: getNamespace(m.pvc),
        },
        selection: {
          action: MTC_PV_ACTION_COPY,
          copyMethod: MTC_PV_COPY_METHOD_FILESYSTEM,
          storageClass: destinationStorageClass,
        },
        supported: {
          actions: [...MTC_PV_SUPPORTED.actions],
          copyMethods: [...MTC_PV_SUPPORTED.copyMethods],
        },
      })),
      srcMigClusterRef: MTC_HOST_CLUSTER_REF,
    },
  };

  const createdPlan = await kubevirtK8sCreate<MigPlan>({
    cluster,
    data: migPlan,
    model: MigPlanModel,
  });

  const planName = getName(createdPlan);
  const migMigration: MigMigration = {
    apiVersion: `${MigMigrationModel.apiGroup}/${MigMigrationModel.apiVersion}`,
    kind: MigMigrationModel.kind,
    metadata: {
      name: truncateToK8sName(`${MIGRATION_PREFIX}-${planName || getRandomChars()}`, ''),
      namespace: MTC_MIGRATION_NAMESPACE,
    },
    spec: {
      migPlanRef: {
        name: planName,
        namespace: MTC_MIGRATION_NAMESPACE,
      },
      stage: false,
    },
  };

  try {
    await kubevirtK8sCreate<MigMigration>({
      cluster,
      data: migMigration,
      model: MigMigrationModel,
    });
  } catch (migMigrationError) {
    try {
      await kubevirtK8sDelete({ cluster, model: MigPlanModel, resource: createdPlan });
    } catch (rollbackError) {
      kubevirtConsole.warn('Failed to rollback MigPlan after MigMigration creation failure', {
        rollbackError: String(rollbackError),
      });
    }
    throw migMigrationError;
  }

  return normalizeMTCPlan(createdPlan, kubeVirtShapedSpec);
};
