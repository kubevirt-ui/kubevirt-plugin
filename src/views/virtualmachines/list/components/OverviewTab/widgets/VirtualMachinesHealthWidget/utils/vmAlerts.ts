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
    [AlertType.critical]: appendSeverityFilter(baseUrl, AlertType.critical),
    [AlertType.info]: appendSeverityFilter(baseUrl, AlertType.info),
    [AlertType.warning]: appendSeverityFilter(baseUrl, AlertType.warning),
  };
};

export type VMAlertsProps = {
  alertsBaseHref?: string;
  alertsBasePath?: string;
  vmNames?: string[];
};
