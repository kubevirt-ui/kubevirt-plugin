export type PendingChange = {
  hasPendingChange: boolean;
  tabLabel: string;
  label: string;
  handleAction: () => void;
};
