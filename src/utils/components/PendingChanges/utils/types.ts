export type PendingChange = {
  handleAction: () => void;
  hasPendingChange: boolean;
  label: string;
  tabLabel: string;
};

export type NICHotPlugPendingChanges = {
  nicHotPlugPendingChanges: PendingChange[];
  nicNonHotPlugPendingChanges: PendingChange[];
};
