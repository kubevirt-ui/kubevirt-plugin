export enum AlertType {
  critical = 'critical',
  info = 'info',
  warning = 'warning',
}

export type SimplifiedAlert = {
  alertName: string;
  description: string;
  isVMAlert: boolean;
  key: string;
  link: string;
  time: string;
};

export type SimplifiedAlerts = {
  [key in AlertType]: SimplifiedAlert[];
};
