import {
  V1beta1StorageSpecAccessModesEnum,
  V1beta1StorageSpecVolumeModeEnum,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
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
export type MultiNamespaceVirtualMachineStorageMigrationPlan = K8sResourceCommon & {
  spec: {
    namespaces: {
      name: string;
      virtualMachines: VirtualMachinesMigrationSpec[];
    }[];
  };
  status?: {
    namespaces: {
      completedMigrations: MigrationStatus[];
      completedOutOf: number;
      conditions: K8sResourceCondition[];
      failedMigrations: MigrationStatus[];
      inProgressMigrations: MigrationStatus[];
      invalidMigrations: MigrationStatus[];
      readyMigrations: MigrationStatus[];
      suffix: string;
    }[];
  };
};

export type VirtualMachineStorageMigrationPlan = K8sResourceCommon & {
  spec: {
    virtualMachines: VirtualMachinesMigrationSpec[];
  };
  status?: {
    completedMigrations: MigrationStatus[];
    completedOutOf: number;
    conditions: K8sResourceCondition[];
    failedMigrations: MigrationStatus[];
    inProgressMigrations: MigrationStatus[];
    invalidMigrations: MigrationStatus[];
    readyMigrations: MigrationStatus[];
    suffix: string;
  };
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

export const STATUS_IN_PROGRESS = 'InProgress';
