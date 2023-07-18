import {
  hasPendingChange,
  nonHotPlugNICChangesExist,
} from '@kubevirt-utils/components/PendingChanges/utils/helpers';
import {
  NICHotPlugPendingChanges,
  PendingChange,
} from '@kubevirt-utils/components/PendingChanges/utils/types';

export const showLiveMigrateAndRestartSections = (
  bridgeNICHotPlugEnabled: boolean,
  pendingChanges: PendingChange[],
  sortedNICHotPlugPendingChanges: NICHotPlugPendingChanges,
) => {
  const { nicHotPlugPendingChanges, nicNonHotPlugPendingChanges } = sortedNICHotPlugPendingChanges;
  const showLiveMigrateSection =
    bridgeNICHotPlugEnabled && hasPendingChange(nicHotPlugPendingChanges);
  const showRestartSection =
    !bridgeNICHotPlugEnabled ||
    nonHotPlugNICChangesExist(pendingChanges, hasPendingChange(nicNonHotPlugPendingChanges));
  return showLiveMigrateSection && showRestartSection;
};
