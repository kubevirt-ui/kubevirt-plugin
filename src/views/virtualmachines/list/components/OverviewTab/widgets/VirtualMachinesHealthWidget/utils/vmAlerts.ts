import { AlertType } from '@kubevirt-utils/components/AlertsCard/utils/types';

export const SEVERITY_FILTER_PARAM = 'rowFilter-alert-severity';

export const appendSeverityFilter = (baseUrl: string, severity: AlertType): string => {
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}${SEVERITY_FILTER_PARAM}=${severity}`;
};

export type SeverityUrls = Partial<Record<AlertType, string>>;

export const getSeverityUrls = (baseUrl?: string): SeverityUrls => {
  if (!baseUrl) return {};
  return {
    [AlertType.Critical]: appendSeverityFilter(baseUrl, AlertType.Critical),
    [AlertType.Info]: appendSeverityFilter(baseUrl, AlertType.Info),
    [AlertType.Warning]: appendSeverityFilter(baseUrl, AlertType.Warning),
  };
};

export type VMAlertsProps = {
  alertsBaseHref?: string;
  alertsBasePath?: string;
  vmNames?: string[];
};
