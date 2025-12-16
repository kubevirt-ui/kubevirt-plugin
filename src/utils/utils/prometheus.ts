import { murmur3 } from 'murmurhash-js';

import { CNV_OBSERVABILITY, KUBEVIRT, NONE } from '@kubevirt-utils/constants/constants';
import { MONITORING_SALT, OPERATOR_LABEL_KEY } from '@kubevirt-utils/constants/prometheus';
import { Group } from '@kubevirt-utils/types/prometheus';
import { Alert, PrometheusLabels, PrometheusRule } from '@openshift-console/dynamic-plugin-sdk';

/**
 * Escapes special characters in PromQL label values for use in exact match filters.
 * Escapes backslashes and double quotes to prevent PromQL injection issues.
 *
 * @param v - The label value to escape
 * @returns The escaped label value safe for use in PromQL queries like `label="${escapedValue}"`
 */
export const escapePromLabelValue = (v: string): string =>
  v.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

/**
 * Regex pattern matching all special regex characters that need to be escaped in PromQL regex patterns.
 * Matches: . * + ? ^ $ { } ( ) | [ ] \
 */
const PROMQL_REGEX_SPECIAL_CHARS_PATTERN = /[.*+?^${}()|[\]\\]/g;

/**
 * Escapes special regex characters in PromQL label values for use in regex match filters.
 * Escapes characters like . * + ? ^ $ { } ( ) | [ ] \ to prevent regex injection issues.
 *
 * @param v - The label value to escape
 * @returns The escaped label value safe for use in PromQL regex queries like `label=~"${escapedValue}"`
 */
export const escapePromRegexValue = (v: string): string =>
  v.replace(PROMQL_REGEX_SPECIAL_CHARS_PATTERN, '\\$&');

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
  alert?.labels?.[OPERATOR_LABEL_KEY] === KUBEVIRT &&
  alert?.labels?.operator_health_impact !== NONE &&
  alert?.labels?.kubernetes_operator_component !== CNV_OBSERVABILITY;

export const inNamespace = (namespace: string, alert: Alert): boolean =>
  alert?.labels?.namespace === namespace;
