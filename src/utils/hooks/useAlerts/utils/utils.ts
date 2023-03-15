import { murmur3 } from 'murmurhash-js';

import { MONITORING_SALT } from '@kubevirt-utils/constants/prometheus';
import { Group, PrometheusRulesResponse } from '@kubevirt-utils/types/prometheus';
import { generateAlertId } from '@kubevirt-utils/utils/prometheus';
import {
  Alert,
  AlertStates,
  PrometheusAlert,
  PrometheusRule,
  Rule,
  RuleStates,
  Silence,
  SilenceStates,
} from '@openshift-console/dynamic-plugin-sdk';

export const addAlertIdToRule = (group: Group, rule: PrometheusRule): Rule => {
  const key = generateAlertId(group, rule);
  return { ...rule, id: String(murmur3(key, MONITORING_SALT)) };
};

export const getAlertsAndRules = (
  data: PrometheusRulesResponse['data'],
): { alerts: Alert[]; rules: Rule[] } => {
  // Flatten the rules data to make it easier to work with, discard non-alerting rules since those
  // are the only ones we will be using and add a unique ID to each rule.
  const groups = data?.groups as Group[];
  const rules = groups?.flatMap((group) =>
    group?.rules
      ?.filter((rule) => rule?.type === 'alerting')
      ?.map((rule) => addAlertIdToRule(group, rule)),
  );

  // Add rule object to each alert
  const alerts = rules?.flatMap((rule) => rule?.alerts?.map((alert) => ({ rule, ...alert })));

  return { alerts, rules };
};

export const isSilenced = (alert: Alert | PrometheusAlert, silence: Silence): boolean =>
  [AlertStates.Firing, AlertStates.Silenced].includes(alert.state) &&
  silence?.matchers?.every((matcher) => {
    const alertValue = alert?.labels?.[matcher.name] || '';
    const isMatch = matcher.isRegex
      ? new RegExp(`^${matcher.value}$`).test(alertValue)
      : alertValue === matcher.value;
    return matcher.isEqual === false && alertValue ? !isMatch : isMatch;
  });

const getSilencesForAlert = (alert: Alert, activeSilences: Silence[]): Silence[] =>
  activeSilences?.filter((silence) => isSilenced(alert, silence));

const getSilencesForRule = (alert: Alert, activeSilences: Silence[]): Silence[] =>
  activeSilences?.filter((silence) =>
    alert?.rule?.alerts?.some((ruleAlert) => isSilenced(ruleAlert, silence)),
  );

const setRuleAlertsState = (alert: Alert) =>
  alert?.rule?.alerts?.forEach((ruleAlert) => {
    if (alert?.silencedBy?.some((silence) => isSilenced(ruleAlert, silence))) {
      ruleAlert.state = AlertStates.Silenced;
    }
  });

const alertIsSilenced = (alert: Alert): boolean => alert?.silencedBy?.length > 0;

const allRuleAlertsAreSilenced = (alert): boolean =>
  alert?.rule?.alerts?.every((rulesAlert) => rulesAlert.state === AlertStates.Silenced);

/**
 *  For each firing alert, store a list of the Silences that
 *  are silencing it and set its state to show it is silenced
 * @param alerts All alerts in the cluster
 * @param silences All silences in the cluster
 */
export const silenceFiringAlerts = (alerts: Alert[], silences): Alert[] => {
  const activeSilences = silences?.filter(
    (silence) => silence?.status?.state === SilenceStates.Active,
  );

  return alerts?.map((alert) => {
    // Skip alerts non-firing alerts
    if (alert?.state !== AlertStates.Firing) {
      return alert;
    }

    alert.silencedBy = getSilencesForAlert(alert, activeSilences);
    if (alertIsSilenced(alert)) {
      alert.state = AlertStates.Silenced;
      setRuleAlertsState(alert);
      if (allRuleAlertsAreSilenced(alert)) {
        alert.rule.state = RuleStates.Silenced;
        alert.rule.silencedBy = getSilencesForRule(alert, activeSilences);
      }
    }
    return alert;
  });
};
