import { PendingChange } from '@kubevirt-utils/components/PendingChanges/utils/types';

export const splitPendingChanges = (
  pendingChanges: PendingChange[],
): { liveMigrationChanges: PendingChange[]; restartChanges: PendingChange[] } =>
  pendingChanges.reduce(
    (acc, pendingChange) => {
      if (!pendingChange.hasPendingChange) return acc;

      if (pendingChange.appliedOnLiveMigration) {
        acc.liveMigrationChanges.push(pendingChange);
        return acc;
      }

      acc.restartChanges.push(pendingChange);
      return acc;
    },
    { liveMigrationChanges: [], restartChanges: [] },
  );
