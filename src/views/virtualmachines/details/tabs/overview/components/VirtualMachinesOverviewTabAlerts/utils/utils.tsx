import React from 'react';
import { murmur3 } from 'murmurhash-js';

import { PrometheusLabels, PrometheusRule } from '@openshift-console/dynamic-plugin-sdk';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-circle-icon';
import ExclamationTriangleIcon from '@patternfly/react-icons/dist/js/icons/exclamation-triangle-icon';

export enum AlertType {
  critical = 'critical',
  warning = 'warning',
  info = 'info',
}

export const KUBEVIRT = 'kubevirt';
export const MONITORING_URL_BASE = '/monitoring/alerts';
const MONITORING_SALT = 'monitoring-salt';

type Group = {
  rules: PrometheusRule[];
  file: string;
  name: string;
};

export type PrometheusRulesResponse = {
  data: {
    groups?: Group[];
  };
  status: string;
};

export type VMAlerts = {
  [key in AlertType]: { time: string; alertName: string; description: string; link: string }[];
};

export const generateAlertId = (group: Group, rule: PrometheusRule): string => {
  const key = [
    group?.file,
    group?.name,
    rule?.name,
    rule?.duration,
    rule?.query,
    ...Object?.entries(rule?.labels).map(([k, v]) => `${v}=${k}`),
  ].join(',');
  return String(murmur3(key, MONITORING_SALT));
};

export const labelsToParams = (labels: PrometheusLabels): string => {
  return Object.entries(labels)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
};

export const icon = {
  [AlertType.critical]: <ExclamationCircleIcon />,
  [AlertType.warning]: <ExclamationTriangleIcon />,
  [AlertType.info]: <ExclamationCircleIcon />,
};
