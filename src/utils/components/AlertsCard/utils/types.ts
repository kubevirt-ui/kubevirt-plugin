export enum AlertType {
  Critical = 'critical',
  Info = 'info',
  Warning = 'warning',
}

export type SimplifiedAlert = {
  alertName: string;
  cluster?: string;
  description: string;
  externalLink?: string;
  isVMAlert: boolean;
  key: string;
  link: string;
  namespace?: string;
  time: string;
  vmName?: string;
};

export type SimplifiedAlerts = {
  [key in AlertType]: SimplifiedAlert[];
};
