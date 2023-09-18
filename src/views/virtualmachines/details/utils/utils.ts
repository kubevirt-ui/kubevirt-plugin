import {
  hasPendingChange,
  nonHotPlugNICChangesExist,
} from '@kubevirt-utils/components/PendingChanges/utils/helpers';
import {
  NICHotPlugPendingChanges,
  PendingChange,
} from '@kubevirt-utils/components/PendingChanges/utils/types';

export const showPendingChangesSections = (
  nicHotPlugEnabled: boolean,
  pendingChanges: PendingChange[],
  sortedNICHotPlugPendingChanges: NICHotPlugPendingChanges,
): { showLiveMigrateSection: boolean; showRestartSection: boolean } => {
  const { nicHotPlugPendingChanges, nicNonHotPlugPendingChanges } = sortedNICHotPlugPendingChanges;

  return {
    showLiveMigrateSection: nicHotPlugEnabled && hasPendingChange(nicHotPlugPendingChanges),
    showRestartSection:
      !nicHotPlugEnabled ||
      nonHotPlugNICChangesExist(pendingChanges, hasPendingChange(nicNonHotPlugPendingChanges)),
  };
};
