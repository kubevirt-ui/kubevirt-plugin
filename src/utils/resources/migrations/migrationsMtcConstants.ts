import {
  K8sModel,
  K8sResourceCommon,
  K8sResourceCondition,
} from '@openshift-console/dynamic-plugin-sdk';

export const DEFAULT_MIGRATION_NAMESPACE = 'openshift-migration';

export const MigPlanModel: K8sModel = {
  abbr: 'MP',
  apiGroup: 'migration.openshift.io',
  apiVersion: 'v1alpha1',
  crd: true,
  kind: 'MigPlan',
  label: 'MigPlan',
  labelPlural: 'MigPlans',
  namespaced: true,
  plural: 'migplans',
};

export const MigrationControllerModel: K8sModel = {
  abbr: 'MC',
  apiGroup: 'migration.openshift.io',
  apiVersion: 'v1alpha1',
  crd: true,
  kind: 'MigrationController',
  label: 'MigrationController',
  labelPlural: 'MigrationControllers',
  namespaced: true,
  plural: 'migrationcontrollers',
};

export const MigMigrationModel: K8sModel = {
  abbr: 'MM',
  apiGroup: 'migration.openshift.io',
  apiVersion: 'v1alpha1',
  crd: true,
  kind: 'MigMigration',
  label: 'MigMigration',
  labelPlural: 'MigMigrations',
  namespaced: true,
  plural: 'migmigrations',
};

export const MigMigrationStatuses = {
  Completed: 'Completed',
  Failed: 'Failed',
};

export type PersistentVolumesMigPlan = {
  capacity: string;
  name: string;
  proposedCapacity: string;
  pvc: {
    accessModes: string[];
    hasReference?: boolean;
    name: string;
    namespace: string;
    ownerType?: string;
    volumeMode: string;
  };
  selection: {
    action: 'copy' | 'skip';
    copyMethod: string;
    storageClass: string;
  };
  storageClass: string;
  supported: {
    actions: string[];
    copyMethods: string[];
  };
};

export type MigPlan = K8sResourceCommon & {
  spec: {
    [key: string]: unknown;
    persistentVolumes?: PersistentVolumesMigPlan[];
  };
  status?: { conditions: K8sResourceCondition[]; suffix: string };
};

export type MigMigration = K8sResourceCommon & {
  spec: {
    canceled: boolean;
    migPlanRef: {
      name: string;
      namespace: string;
    };
    migrateState: boolean;
    quiescePods: boolean;
    stage: boolean;
  };
  status?: {
    conditions?: K8sResourceCondition[];
    phase: string;
    startTimestamp?: string;
  };
};

export type LiveMigrationProgress = {
  lastObservedProgressPercent: string;
  pvcRef: {
    name: string;
    namespace: string;
  };
  totalElapsedTime: string;
  vmName: string;
  vmNamespace: string;
};

export type PodProgress = {
  lastObservedProgressPercent: string;
  pvcRef: {
    name: string;
    namespace: string;
  };
  totalElapsedTime: string;
};

export type DirectVolumeMigration = K8sResourceCommon & {
  status?: {
    failedLiveMigration?: LiveMigrationProgress[];
    failedPods?: PodProgress[];
    phase: string;
    runningLiveMigration?: LiveMigrationProgress[];
    runningPods?: PodProgress[];
    successfulLiveMigration?: LiveMigrationProgress[];
    successfulPods?: PodProgress[];
  };
};

export const DirectVolumeMigrationModel: K8sModel = {
  abbr: 'DVM',
  apiGroup: 'migration.openshift.io',
  apiVersion: 'v1alpha1',
  crd: true,
  kind: 'DirectVolumeMigration',
  label: 'DirectVolumeMigration',
  labelPlural: 'DirectVolumeMigrations',
  namespaced: true,
  plural: 'directvolumemigrations',
};

export const MigStorageModel: K8sModel = {
  abbr: 'MS',
  apiGroup: 'migration.openshift.io',
  apiVersion: 'v1alpha1',
  crd: true,
  kind: 'MigStorage',
  label: 'MigStorage',
  labelPlural: 'MigStorages',
  namespaced: true,
  plural: 'migstorages',
};
