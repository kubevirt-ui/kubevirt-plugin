import {
  V1beta1StorageSpecAccessModesEnum,
  V1beta1StorageSpecVolumeModeEnum,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { K8sResourceCommon, K8sResourceCondition } from '@openshift-console/dynamic-plugin-sdk';

export type MigrationStatus = {
  name: string;
  sourcePVCs: {
    name: string;
  }[];
};

export type VirtualMachinesMigrationSpec = {
  name: string;
  targetMigrationPVCs: {
    destinationPVC: {
      accessModes?: V1beta1StorageSpecAccessModesEnum[];
      name?: string;
      storageClassName?: string;
      volumeMode?: V1beta1StorageSpecVolumeModeEnum;
    };
    volumeName: string;
  }[];
};

export const STORAGE_MIGRATION_PHASE = {
  COMPLETED: 'completedMigrations',
  FAILED: 'failedMigrations',
  IN_PROGRESS: 'inProgressMigrations',
  INVALID: 'invalidMigrations',
  READY: 'readyMigrations',
} as const;

export type StorageMigrationPlanNamespaceStatus = {
  [STORAGE_MIGRATION_PHASE.COMPLETED]: MigrationStatus[];
  [STORAGE_MIGRATION_PHASE.FAILED]: MigrationStatus[];
  [STORAGE_MIGRATION_PHASE.IN_PROGRESS]: MigrationStatus[];
  [STORAGE_MIGRATION_PHASE.INVALID]: MigrationStatus[];
  [STORAGE_MIGRATION_PHASE.READY]: MigrationStatus[];
  completedOutOf: number;
  conditions: K8sResourceCondition[];
  suffix: string;
};

export const STORAGE_MIGRATION_PLAN_RETENTION_POLICY = {
  DELETE_SOURCE: 'deleteSource',
  KEEP_SOURCE: 'keepSource',
} as const;

export type StorageMigrationPlanRetentionPolicy =
  (typeof STORAGE_MIGRATION_PLAN_RETENTION_POLICY)[keyof typeof STORAGE_MIGRATION_PLAN_RETENTION_POLICY];

export type MultiNamespaceVirtualMachineStorageMigrationPlan = K8sResourceCommon & {
  spec: {
    namespaces: {
      name: string;
      retentionPolicy?: StorageMigrationPlanRetentionPolicy;
      virtualMachines: VirtualMachinesMigrationSpec[];
    }[];
  };
  status?: {
    namespaces: StorageMigrationPlanNamespaceStatus[];
  };
};

export type VirtualMachineStorageMigrationPlan = K8sResourceCommon & {
  spec: {
    retentionPolicy?: StorageMigrationPlanRetentionPolicy;
    virtualMachines: VirtualMachinesMigrationSpec[];
  };
  status?: StorageMigrationPlanNamespaceStatus;
};

export type MultiNamespaceVirtualMachineStorageMigration = K8sResourceCommon & {
  spec: {
    multiNamespaceVirtualMachineStorageMigrationPlanRef: {
      name: string;
    };
  };
};

export type VirtualMachineStorageMigration = K8sResourceCommon & {
  spec: {
    virtualMachineStorageMigrationPlanRef: {
      name: string;
    };
  };
};

export const STATUS_COMPLETED = 'Completed';

export const STATUS_IN_PROGRESS = 'In Progress';
export const STATUS_READY = 'Ready';
