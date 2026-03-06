import {
  MultiNamespaceVirtualMachineStorageMigrationPlan,
  STORAGE_MIGRATION_PHASE,
} from '@kubevirt-utils/resources/migrations/constants';
import { isMigrationCompleted } from '@kubevirt-utils/resources/migrations/utils';
import { getStatusNamespaces } from '@kubevirt-utils/resources/shared';

type StorageMigrationStatusCounts = {
  other: number;
  pending: number;
  running: number;
};

export const getStorageMigrationStatusCounts = (
  plans: MultiNamespaceVirtualMachineStorageMigrationPlan[],
): StorageMigrationStatusCounts => {
  let pending = 0;
  let running = 0;
  let other = 0;
  for (const plan of plans || []) {
    const namespaces = getStatusNamespaces(plan);
    const hasFailed = namespaces?.some((ns) => ns?.[STORAGE_MIGRATION_PHASE.FAILED]?.length > 0);
    const hasInProgress = namespaces?.some(
      (ns) => ns?.[STORAGE_MIGRATION_PHASE.IN_PROGRESS]?.length > 0,
    );
    const hasInvalid = namespaces?.some((ns) => ns?.[STORAGE_MIGRATION_PHASE.INVALID]?.length > 0);
    const completed = isMigrationCompleted(plan);

    if (hasFailed || hasInvalid) {
      other++;
    } else if (hasInProgress) {
      running++;
    } else if (!completed) {
      pending++;
    } else {
      other++;
    }
  }

  return { other, pending, running };
};
