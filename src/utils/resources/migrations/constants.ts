import {
  V1beta1StorageSpecAccessModesEnum,
  V1beta1StorageSpecVolumeModeEnum,
  V1Condition,
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

export const K8S_CONDITION_STATUS_TRUE = 'True';

export const CONDITION_TYPE_FAILED = 'Failed';
export const CONDITION_TYPE_SUCCEEDED = 'Succeeded';

export const MIG_MIGRATION_PHASE = {
  COMPLETED: 'completed',
  FAILED: 'failed',
  SUCCESSFUL: 'successful',
} as const;

export const MTC_PLAN_VM_PLACEHOLDER = 'mtc';

export const MTC_PV_ACTION_COPY = 'copy';
export const MTC_PV_COPY_METHOD_FILESYSTEM = 'filesystem';

export const MTC_MIGRATION_NAMESPACE = 'openshift-migration';

export const STORAGE_MIGRATION_API = {
  LOADING: 'loading',
  MTC: 'mtc',
  MULTI_NS: 'multiNamespace',
  NONE: 'none',
  SINGLE_NS: 'singleNamespace',
} as const;

export type StorageMigrationAPI =
  (typeof STORAGE_MIGRATION_API)[keyof typeof STORAGE_MIGRATION_API];

export type MigPlanPVSelection = {
  action?: string;
  copyMethod?: string;
  storageClass?: string;
};

export type MigPlanPV = {
  capacity?: string;
  name?: string;
  pvc?: { name?: string; namespace?: string };
  selection?: MigPlanPVSelection;
  storageClass?: string;
  supported?: { actions?: string[]; copyMethods?: string[] };
};

export type MigPlan = K8sResourceCommon & {
  spec: {
    closed?: boolean;
    destMigClusterRef?: { name: string; namespace: string };
    indirectVolumeMigration?: boolean;
    liveMigrate?: boolean;
    namespaces?: string[];
    persistentVolumes?: MigPlanPV[];
    srcMigClusterRef?: { name: string; namespace: string };
  };
  status?: {
    conditions?: V1Condition[];
    destStorageClasses?: { name: string }[];
    srcStorageClasses?: { name: string }[];
  };
};

export type MigMigration = K8sResourceCommon & {
  spec: {
    canceled?: boolean;
    migPlanRef?: { name: string; namespace: string };
    migrateState?: boolean;
    quiescePods?: boolean;
    rollback?: boolean;
    stage?: boolean;
    verify?: boolean;
  };
  status?: {
    conditions?: V1Condition[];
    phase?: string;
  };
};
