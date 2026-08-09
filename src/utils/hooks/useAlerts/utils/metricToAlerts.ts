import { KUBEVIRT } from '@kubevirt-utils/constants/constants';
import { SECONDS_TO_MILLISECONDS_MULTIPLIER } from '@kubevirt-utils/resources/vm/utils/constants';
import { type PrometheusRulesResponse } from '@kubevirt-utils/types/prometheus';
import {
  type Alert,
  AlertSeverity,
  AlertStates,
  type PrometheusAlert,
  type PrometheusRule,
  type Rule,
  RuleStates,
} from '@openshift-console/dynamic-plugin-sdk';
import { type PrometheusResponse } from '@openshift-console/dynamic-plugin-sdk';

import { addAlertIdToRule } from './utils';

const getAnnotationValue = (primary: string | undefined, fallback: string | undefined): string =>
  primary?.trim() ? primary : (fallback ?? '');

/**
 * Convert ALERTS metric query results to Alert objects
 * The ALERTS metric returns time series with labels that represent alerts
 * @param response - Prometheus response containing ALERTS metric query results
 */
export const convertMetricResultsToAlerts = (response: null | PrometheusResponse): Alert[] => {
  if (!response?.data?.result) {
    return [];
  }

  const alerts: Alert[] = [];

  for (const result of response.data.result) {
    const labels = result.metric || {};
    const { alertname, alertstate, severity = AlertSeverity.Warning } = labels;

    if (!alertname) {
      continue;
    }

    // Skip non-firing alerts
    if (alertstate !== AlertStates.Firing) {
      continue;
    }

    // Create a minimal PrometheusAlert from metric labels
    // ALERTS metric has value [timestamp, 1] when active
    const timestamp = result.value?.[0]
      ? new Date(Number(result.value[0]) * SECONDS_TO_MILLISECONDS_MULTIPLIER).toISOString()
      : new Date().toISOString();

    const prometheusAlert: PrometheusAlert = {
      activeAt: timestamp,
      annotations: {
        description: getAnnotationValue(labels.description, labels.message),
        summary: getAnnotationValue(labels.summary, labels.message),
      },
      labels: {
        ...labels,
        alertname,
        alertstate,
        severity,
      },
      state: alertstate as AlertStates,
      value: result.value?.[1] ?? '1',
    };

    const prometheusRule: PrometheusRule = {
      alerts: [],
      annotations: {
        description: getAnnotationValue(labels.description, labels.message),
        summary: getAnnotationValue(labels.summary, labels.message),
      },
      duration: 0,
      labels: {
        ...labels,
        alertname,
        severity,
      },
      name: alertname,
      query: '',
      state: RuleStates.Firing,
      type: 'alerting',
    };

    // Generate unique ID and create Rule
    const rule: Rule = {
      ...addAlertIdToRule({ file: labels.file ?? '', name: alertname, rules: [] }, prometheusRule),
      alerts: [prometheusAlert],
    };

    // Create Alert object combining rule and alert
    const alert: Alert = {
      ...prometheusAlert,
      rule,
    };

    alerts.push(alert);
  }

  return alerts;
};

/**
 * Convert Prometheus Rules API response to Alert objects
 * The RULES endpoint returns full alert information including timestamps and descriptions
 * @param response - Prometheus response containing rules with alerts
 */
export const convertRulesToAlerts = (response: null | PrometheusRulesResponse): Alert[] => {
  if (!response?.data?.groups) {
    return [];
  }

  const alerts: Alert[] = [];

  for (const ruleGroup of response.data.groups) {
    for (const rule of ruleGroup.rules ?? []) {
      // Only process firing rules for KubeVirt operator
      if (
        rule?.state === RuleStates.Firing &&
        rule?.labels?.kubernetes_operator_part_of === KUBEVIRT
      ) {
        for (const prometheusAlert of rule.alerts ?? []) {
          // Create Rule object with ID
          const ruleWithId: Rule = addAlertIdToRule(ruleGroup, rule);

          // Create Alert object combining rule and alert
          const alert: Alert = {
            ...prometheusAlert,
            rule: ruleWithId,
          };

          alerts.push(alert);
        }
      }
    }
  }

  return alerts;
};
