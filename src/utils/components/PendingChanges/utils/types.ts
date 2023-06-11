export type PendingChange = {
  handleAction: () => void;
  hasPendingChange: boolean;
  label: string;
  tabLabel: string;
};
