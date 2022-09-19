export enum AlertType {
  critical = 'critical',
  warning = 'warning',
  info = 'info',
}

export type SimplifiedAlert = {
  time: string;
  alertName: string;
  description: string;
  link: string;
  key: string;
  isVMAlert: boolean;
};

export type SimplifiedAlerts = {
  [key in AlertType]: SimplifiedAlert[];
};
