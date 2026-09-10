import type { StorageMigrationPlanNamespaceStatus } from '../constants';
import { STORAGE_MIGRATION_PHASE } from '../constants';

export const emptyNamespaceStatus = (): StorageMigrationPlanNamespaceStatus => ({
  completedOutOf: 0,
  conditions: [],
  [STORAGE_MIGRATION_PHASE.COMPLETED]: [],
  [STORAGE_MIGRATION_PHASE.FAILED]: [],
  [STORAGE_MIGRATION_PHASE.IN_PROGRESS]: [],
  [STORAGE_MIGRATION_PHASE.INVALID]: [],
  [STORAGE_MIGRATION_PHASE.READY]: [],
  suffix: '',
});
