import { murmur3 } from 'murmurhash-js';

import { KUBEVIRT } from '@kubevirt-utils/constants/constants';
import { MONITORING_SALT, OPERATOR_LABEL_KEY } from '@kubevirt-utils/constants/prometheus';
import { Group } from '@kubevirt-utils/types/prometheus';
import { Alert, PrometheusLabels, PrometheusRule } from '@openshift-console/dynamic-plugin-sdk';

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

export const isKubeVirtAlert = (alert: Alert): boolean =>
  alert?.labels?.[OPERATOR_LABEL_KEY] === KUBEVIRT;

export const inNamespace = (namespace: string, alert: Alert): boolean =>
  alert?.labels?.namespace === namespace;
