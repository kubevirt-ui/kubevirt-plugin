import { murmur3 } from 'murmurhash-js';

import { PrometheusLabels, PrometheusRule } from '@openshift-console/dynamic-plugin-sdk';

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
export const createURL = (append: string, url: string): string =>
  url?.endsWith('/') ? `${url}${append}` : `${url}/${append}`;
