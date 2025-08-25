import { VirtualMachineDetailsTab } from '@kubevirt-utils/constants/tabs-constants';

export type PendingChange = {
  handleAction: () => void;
  hasPendingChange: boolean;
  label: string;
  tab: VirtualMachineDetailsTab;
  tabLabel: string;
};

export type NICHotPlugPendingChanges = {
  nicHotPlugPendingChanges: PendingChange[];
  nicNonHotPlugPendingChanges: PendingChange[];
};
