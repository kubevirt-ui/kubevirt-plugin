import {
  K8sModel,
  K8sResourceCommon,
  K8sResourceCondition,
} from '@openshift-console/dynamic-plugin-sdk';

export type MigPlan = K8sResourceCommon & { spec: any; status?: { suffix: string } };

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
  };
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

export type DirectVolumeMigration = K8sResourceCommon & {
  status?: {
    phase: string;
    runningLiveMigration?: LiveMigrationProgress[];
    successfulLiveMigration?: LiveMigrationProgress[];
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

export const MigMigrationStatuses = {
  Completed: 'Completed',
  Failed: 'Failed',
};
