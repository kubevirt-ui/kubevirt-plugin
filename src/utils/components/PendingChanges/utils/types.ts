export type PendingChange = {
  hasPendingChange: boolean;
  tabLabel: string;
  label: string;
  action: () => void;
};
