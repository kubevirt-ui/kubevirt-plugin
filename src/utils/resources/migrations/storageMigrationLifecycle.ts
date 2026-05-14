import { getStatusNamespaces } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import {
  MultiNamespaceVirtualMachineStorageMigrationPlan,
  STORAGE_MIGRATION_PHASE,
} from './constants';
import { isMigrationCompleted } from './utils';

export enum StorageMigrationStatusFilterValue {
  Completed = 'Completed',
  Failed = 'Failed',
  Pending = 'Pending',
  Running = 'Running',
}

/**
 * Lifecycle summary for a storage migration plan (list filters, wizard status).
 * Completed is evaluated before Running so stale in-progress slices cannot mask a finished plan.
 * @param plan
 */
export const getStorageMigrationStatus = (
  plan: MultiNamespaceVirtualMachineStorageMigrationPlan,
): StorageMigrationStatusFilterValue => {
  const namespaces = getStatusNamespaces(plan);
  const hasFailed = namespaces?.some((ns) => !isEmpty(ns?.[STORAGE_MIGRATION_PHASE.FAILED]));
  const hasInvalid = namespaces?.some((ns) => !isEmpty(ns?.[STORAGE_MIGRATION_PHASE.INVALID]));
  const hasInProgress = namespaces?.some(
    (ns) => !isEmpty(ns?.[STORAGE_MIGRATION_PHASE.IN_PROGRESS]),
  );
  const completed = isMigrationCompleted(plan);

  if (hasFailed || hasInvalid) return StorageMigrationStatusFilterValue.Failed;
  if (completed) return StorageMigrationStatusFilterValue.Completed;
  if (hasInProgress) return StorageMigrationStatusFilterValue.Running;
  return StorageMigrationStatusFilterValue.Pending;
};
