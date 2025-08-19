import { PendingChange } from '@kubevirt-utils/components/PendingChanges/utils/types';
import {
  VirtualMachineConfigurationTabInner,
  VirtualMachineDetailsTab,
  VirtualMachineDetailsTabLabel,
} from '@kubevirt-utils/constants/tabs-constants';

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

export const getTabNameAndTitle = (tab: VirtualMachineDetailsTab) => ({
  name: tab,
  title: VirtualMachineDetailsTabLabel[tab],
});

export const getTabHrefAndName = (tab: VirtualMachineDetailsTab) => {
  if (VirtualMachineConfigurationTabInner.has(tab)) {
    return {
      href: `${VirtualMachineDetailsTab.Configurations}/${tab}`,
      name: `${VirtualMachineDetailsTab.Configurations}/${tab}`,
    };
  }

  return {
    href: tab,
    name: VirtualMachineDetailsTabLabel[tab],
  };
};
