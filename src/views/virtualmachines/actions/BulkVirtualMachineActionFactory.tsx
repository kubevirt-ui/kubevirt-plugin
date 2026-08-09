import { type TFunction } from 'i18next';

import {
  createPauseConfig,
  createResetConfig,
  createRestartConfig,
  createStartConfig,
  createStopConfig,
  createUnpauseConfig,
} from './bulkLifecycleActionConfigs';
import {
  createControlActionsConfig,
  createDeleteConfig,
  createEditLabelsConfig,
  createSnapshotConfig,
} from './bulkManagementActionConfigs';
import {
  createCrossClusterMigrationConfig,
  createMigrateComputeConfig,
  createMigrateStorageConfig,
} from './bulkMigrationActionConfigs';
import { createEditRunStrategyConfig, createMoveToFolderConfig } from './bulkOrgActionConfigs';
import { type BulkVirtualMachineActionFactory } from './types';

export * from './bulkDeleteUtils';
export * from './bulkLifecycleActionConfigs';
export * from './bulkManagementActionConfigs';
export * from './bulkMigrationActionConfigs';
export * from './bulkOrgActionConfigs';

export const createBulkVirtualMachineActionFactory = (
  t: TFunction,
): BulkVirtualMachineActionFactory => ({
  controlActions: createControlActionsConfig(t),
  crossClusterMigration: createCrossClusterMigrationConfig(t),
  delete: createDeleteConfig(t),
  editLabels: createEditLabelsConfig(t),
  editRunStrategy: createEditRunStrategyConfig(t),
  migrateCompute: createMigrateComputeConfig(t),
  migrateStorage: createMigrateStorageConfig(t),
  moveToFolder: createMoveToFolderConfig(t),
  pause: createPauseConfig(t),
  reset: createResetConfig(t),
  restart: createRestartConfig(t),
  snapshot: createSnapshotConfig(t),
  start: createStartConfig(t),
  stop: createStopConfig(t),
  unpause: createUnpauseConfig(t),
});
