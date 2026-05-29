import type { K8sModel, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import type { SelectedMigration } from '@virtualmachines/actions/components/VirtualMachineMigration/utils/constants';

import type {
  MultiNamespaceVirtualMachineStorageMigrationPlan,
  StorageMigrationAPI,
} from '../constants';

export type StorageMigrationPlanOverviewNormalizer = (
  plan: K8sResourceCommon,
) => MultiNamespaceVirtualMachineStorageMigrationPlan | undefined;

export type MigrateVMsParams = {
  cluster: string;
  destinationStorageClass: string;
  keepOriginalVolumes: boolean;
  migrationPlanName?: string;
  selectedMigrations: SelectedMigration[];
};

export type MigrateVMsFn = (
  params: MigrateVMsParams,
) => Promise<MultiNamespaceVirtualMachineStorageMigrationPlan>;

export type ProgressComponentProps = {
  cluster?: string;
  onClose: () => void;
  storageMigAPI: StorageMigrationAPI;
  storageMigrationPlan: MultiNamespaceVirtualMachineStorageMigrationPlan;
};

export type StorageMigrationBackendDescriptor = {
  api: StorageMigrationAPI;
  /** Namespace for fleet LIST when plans are not in the VM namespace (e.g. MTC). */
  fixedPlanNamespace?: string;
  /** When true, console list links use `getResourceUrl` for `planModel`; otherwise the custom storagemigrations route. */
  listConsolePathUsesResourceUrl: boolean;
  migrateVMs: MigrateVMsFn;
  normalizePlanForOverview: StorageMigrationPlanOverviewNormalizer;
  /**
   * When true, the cluster overview card uses a cluster-scoped watch (`namespaced: false`)
   * for the plan list. Only applies to MULTI_NS.
   */
  overviewUsesClusterScopedPlanWatch: boolean;
  planModel: K8sModel;
};
